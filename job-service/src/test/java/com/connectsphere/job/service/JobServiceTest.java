package com.connectsphere.job.service;

import com.connectsphere.job.dto.*;
import com.connectsphere.job.entity.Job;
import com.connectsphere.job.entity.JobApplication;
import com.connectsphere.job.repository.JobApplicationRepository;
import com.connectsphere.job.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Job Service Tests")
class JobServiceTest {

    @Mock private JobRepository jobRepository;
    @Mock private JobApplicationRepository applicationRepository;
    @Mock private KafkaTemplate<String, Map<String, Object>> kafkaTemplate;

    @InjectMocks private JobService jobService;

    private Job mockJob;

    private static final String RECRUITER_ID = "recruiter-123";
    private static final String USER_ID      = "user-123";
    private static final String JOB_ID       = "job-123";

    @BeforeEach
    void setUp() {
        mockJob = Job.builder()
                .id(JOB_ID)
                .recruiterId(RECRUITER_ID)
                .recruiterName("Amit Desai")
                .title("Senior Backend Developer")
                .description("Looking for a Spring Boot expert")
                .companyName("TechCorp India")
                .location("Pune")
                .jobType("FULL_TIME")
                .experienceLevel("SENIOR")
                .salaryRange("25-40 LPA")
                .status(Job.JobStatus.OPEN)
                .applicationCount(0)
                .requiredSkills(List.of("Java", "Spring Boot"))
                .build();
    }

    // ── Helper ─────────────────────────────────────────────

    private JobApplication buildApplication(String id, JobApplication.ApplicationStatus status) {
        return JobApplication.builder()
                .id(id)
                .jobId(JOB_ID)
                .applicantId(USER_ID)
                .applicantName("Rahul Sharma")
                .applicantEmail("rahul@test.com")
                .coverLetter("I am the perfect candidate")
                .resumeUrl("https://resume.com")
                .status(status)
                .build();
    }

    // ── Create Job Tests ───────────────────────────────────

    @Test
    @DisplayName("Create job — saves and returns response with correct fields")
    void createJob_Success() {
        CreateJobRequest req = new CreateJobRequest();
        req.setTitle("Senior Backend Developer");
        req.setDescription("Looking for a Spring Boot expert");
        req.setCompanyName("TechCorp India");
        req.setLocation("Pune");
        req.setJobType("FULL_TIME");
        req.setExperienceLevel("SENIOR");
        req.setSalaryRange("25-40 LPA");
        req.setRequiredSkills(List.of("Java", "Spring Boot"));

        when(jobRepository.save(any(Job.class))).thenReturn(mockJob);

        JobResponse response = jobService.createJob(RECRUITER_ID, "Amit Desai", req);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Senior Backend Developer");
        assertThat(response.getRecruiterId()).isEqualTo(RECRUITER_ID);
        assertThat(response.getCompanyName()).isEqualTo("TechCorp India");
        assertThat(response.getStatus()).isEqualTo("OPEN");
        assertThat(response.isAlreadyApplied()).isFalse();
        verify(jobRepository, times(1)).save(any(Job.class));
    }

    @Test
    @DisplayName("Create job — recruiter name is set correctly")
    void createJob_SetsRecruiterName() {
        CreateJobRequest req = new CreateJobRequest();
        req.setTitle("DevOps Engineer");
        req.setDescription("Kubernetes expert needed");
        req.setCompanyName("TechCorp");

        when(jobRepository.save(any(Job.class))).thenAnswer(inv -> {
            Job saved = inv.getArgument(0);
            assertThat(saved.getRecruiterName()).isEqualTo("Amit Desai");
            assertThat(saved.getRecruiterId()).isEqualTo(RECRUITER_ID);
            return mockJob;
        });

        jobService.createJob(RECRUITER_ID, "Amit Desai", req);

        verify(jobRepository).save(any(Job.class));
    }

    // ── Get All Jobs Tests ─────────────────────────────────

    @Test
    @DisplayName("Get all jobs — returns paginated OPEN jobs")
    void getAllJobs_ReturnsPaginatedOpenJobs() {
        Page<Job> page = new PageImpl<>(List.of(mockJob), PageRequest.of(0, 10), 1);

        when(jobRepository.findByStatusOrderByCreatedAtDesc(
                eq(Job.JobStatus.OPEN), any())).thenReturn(page);
        when(applicationRepository.existsByJobIdAndApplicantId(any(), any())).thenReturn(false);

        Page<JobResponse> result = jobService.getAllJobs(USER_ID, 0, 10);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo("OPEN");
    }

    @Test
    @DisplayName("Get all jobs — alreadyApplied is true when user applied")
    void getAllJobs_AlreadyApplied_IsTrue() {
        Page<Job> page = new PageImpl<>(List.of(mockJob));

        when(jobRepository.findByStatusOrderByCreatedAtDesc(any(), any())).thenReturn(page);
        when(applicationRepository.existsByJobIdAndApplicantId(JOB_ID, USER_ID)).thenReturn(true);

        Page<JobResponse> result = jobService.getAllJobs(USER_ID, 0, 10);

        assertThat(result.getContent().get(0).isAlreadyApplied()).isTrue();
    }

    @Test
    @DisplayName("Get all jobs — alreadyApplied is false when user has not applied")
    void getAllJobs_AlreadyApplied_IsFalse() {
        Page<Job> page = new PageImpl<>(List.of(mockJob));

        when(jobRepository.findByStatusOrderByCreatedAtDesc(any(), any())).thenReturn(page);
        when(applicationRepository.existsByJobIdAndApplicantId(JOB_ID, USER_ID)).thenReturn(false);

        Page<JobResponse> result = jobService.getAllJobs(USER_ID, 0, 10);

        assertThat(result.getContent().get(0).isAlreadyApplied()).isFalse();
    }

    // ── Get Single Job ─────────────────────────────────────

    @Test
    @DisplayName("Get job — returns correct job by ID")
    void getJob_ReturnsCorrectJob() {
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.existsByJobIdAndApplicantId(JOB_ID, USER_ID)).thenReturn(false);

        JobResponse response = jobService.getJob(JOB_ID, USER_ID);

        assertThat(response.getId()).isEqualTo(JOB_ID);
        assertThat(response.getTitle()).isEqualTo("Senior Backend Developer");
    }

    @Test
    @DisplayName("Get job — throws exception when not found")
    void getJob_NotFound_ThrowsException() {
        when(jobRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.getJob("nonexistent", USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Job not found");
    }

    // ── Apply Job Tests ────────────────────────────────────

    @Test
    @DisplayName("Apply for job — success with APPLIED status")
    void applyForJob_Success() {
        ApplyJobRequest req = new ApplyJobRequest();
        req.setCoverLetter("I am the perfect candidate");
        req.setResumeUrl("https://resume.com");

        // Explicitly set status so @PrePersist is not needed in unit test
        JobApplication savedApp = buildApplication("app-1", JobApplication.ApplicationStatus.APPLIED);

        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.existsByJobIdAndApplicantId(JOB_ID, USER_ID)).thenReturn(false);
        when(applicationRepository.save(any())).thenReturn(savedApp);

        ApplicationResponse response = jobService.applyForJob(
                JOB_ID, USER_ID, "Rahul Sharma", "rahul@test.com", req);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo("APPLIED");
        assertThat(response.getApplicantId()).isEqualTo(USER_ID);
        assertThat(response.getJobId()).isEqualTo(JOB_ID);
        verify(jobRepository).incrementApplicationCount(JOB_ID);
        verify(kafkaTemplate).send(eq("job-events"), any(Map.class));
    }

    @Test
    @DisplayName("Apply for job — fails when already applied")
    void applyForJob_AlreadyApplied_ThrowsException() {
        ApplyJobRequest req = new ApplyJobRequest();
        req.setCoverLetter("Cover letter");

        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.existsByJobIdAndApplicantId(JOB_ID, USER_ID)).thenReturn(true);

        assertThatThrownBy(() ->
                jobService.applyForJob(JOB_ID, USER_ID, "Rahul", "rahul@test.com", req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already applied");

        verify(applicationRepository, never()).save(any());
        verify(jobRepository, never()).incrementApplicationCount(any());
    }

    @Test
    @DisplayName("Apply for job — fails when job is closed")
    void applyForJob_ClosedJob_ThrowsException() {
        mockJob.setStatus(Job.JobStatus.CLOSED);
        ApplyJobRequest req = new ApplyJobRequest();
        req.setCoverLetter("Cover letter");

        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));

        assertThatThrownBy(() ->
                jobService.applyForJob(JOB_ID, USER_ID, "Rahul", "rahul@test.com", req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("closed");

        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Apply for job — Kafka event is published on success")
    void applyForJob_PublishesKafkaEvent() {
        ApplyJobRequest req = new ApplyJobRequest();
        req.setCoverLetter("Great cover letter");

        JobApplication savedApp = buildApplication("app-1", JobApplication.ApplicationStatus.APPLIED);

        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.existsByJobIdAndApplicantId(JOB_ID, USER_ID)).thenReturn(false);
        when(applicationRepository.save(any())).thenReturn(savedApp);

        jobService.applyForJob(JOB_ID, USER_ID, "Rahul", "rahul@test.com", req);

        verify(kafkaTemplate, times(1)).send(eq("job-events"), any(Map.class));
    }

    @Test
    @DisplayName("Apply for job — no Kafka event when job is closed")
    void applyForJob_NoKafkaEventWhenClosed() {
        mockJob.setStatus(Job.JobStatus.CLOSED);
        ApplyJobRequest req = new ApplyJobRequest();

        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));

        assertThatThrownBy(() ->
                jobService.applyForJob(JOB_ID, USER_ID, "Rahul", "rahul@test.com", req));

        verify(kafkaTemplate, never()).send(any(), any(Map.class));
    }

    // ── Get My Applications ────────────────────────────────

    @Test
    @DisplayName("Get my applications — returns all applications for user")
    void getMyApplications_ReturnsAllApplications() {
        List<JobApplication> apps = List.of(
                buildApplication("a1", JobApplication.ApplicationStatus.APPLIED),
                buildApplication("a2", JobApplication.ApplicationStatus.SHORTLISTED)
        );

        when(applicationRepository.findByApplicantIdOrderByAppliedAtDesc(USER_ID))
                .thenReturn(apps);

        List<ApplicationResponse> result = jobService.getMyApplications(USER_ID);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStatus()).isEqualTo("APPLIED");
        assertThat(result.get(1).getStatus()).isEqualTo("SHORTLISTED");
    }

    @Test
    @DisplayName("Get my applications — returns empty list when no applications")
    void getMyApplications_ReturnsEmptyList() {
        when(applicationRepository.findByApplicantIdOrderByAppliedAtDesc(USER_ID))
                .thenReturn(List.of());

        List<ApplicationResponse> result = jobService.getMyApplications(USER_ID);

        assertThat(result).isEmpty();
    }

    // ── Close Job Tests ────────────────────────────────────

    @Test
    @DisplayName("Close job — success when recruiter is owner")
    void closeJob_Success() {
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(jobRepository.save(any())).thenReturn(mockJob);

        jobService.closeJob(JOB_ID, RECRUITER_ID);

        assertThat(mockJob.getStatus()).isEqualTo(Job.JobStatus.CLOSED);
        verify(jobRepository).save(mockJob);
    }

    @Test
    @DisplayName("Close job — fails when user is not the recruiter")
    void closeJob_NotAuthorized_ThrowsException() {
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));

        assertThatThrownBy(() -> jobService.closeJob(JOB_ID, "wrong-recruiter"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Not authorized");

        verify(jobRepository, never()).save(any());
    }

    @Test
    @DisplayName("Close job — throws exception when job not found")
    void closeJob_JobNotFound_ThrowsException() {
        when(jobRepository.findById("bad-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.closeJob("bad-id", RECRUITER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Job not found");
    }

    // ── Delete Job Tests ───────────────────────────────────

    @Test
    @DisplayName("Delete job — success when recruiter is owner")
    void deleteJob_Success() {
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));

        jobService.deleteJob(JOB_ID, RECRUITER_ID);

        verify(jobRepository).delete(mockJob);
    }

    @Test
    @DisplayName("Delete job — fails when not authorized")
    void deleteJob_NotAuthorized_ThrowsException() {
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));

        assertThatThrownBy(() -> jobService.deleteJob(JOB_ID, "wrong-recruiter"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Not authorized");

        verify(jobRepository, never()).delete(any());
    }

    // ── Update Application Status Tests ───────────────────

    @Test
    @DisplayName("Update status to SHORTLISTED — success")
    void updateApplicationStatus_ToShortlisted_Success() {
        JobApplication app = buildApplication("app-1", JobApplication.ApplicationStatus.APPLIED);

        when(applicationRepository.findById("app-1")).thenReturn(Optional.of(app));
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.save(any())).thenReturn(app);

        ApplicationResponse response = jobService.updateApplicationStatus(
                "app-1", RECRUITER_ID, "SHORTLISTED");

        assertThat(app.getStatus()).isEqualTo(JobApplication.ApplicationStatus.SHORTLISTED);
        verify(kafkaTemplate).send(eq("job-events"), any(Map.class));
    }

    @Test
    @DisplayName("Update status to HIRED — success")
    void updateApplicationStatus_ToHired_Success() {
        JobApplication app = buildApplication("app-1", JobApplication.ApplicationStatus.SHORTLISTED);

        when(applicationRepository.findById("app-1")).thenReturn(Optional.of(app));
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.save(any())).thenReturn(app);

        jobService.updateApplicationStatus("app-1", RECRUITER_ID, "HIRED");

        assertThat(app.getStatus()).isEqualTo(JobApplication.ApplicationStatus.HIRED);
    }

    @Test
    @DisplayName("Update status to REJECTED — success")
    void updateApplicationStatus_ToRejected_Success() {
        JobApplication app = buildApplication("app-1", JobApplication.ApplicationStatus.APPLIED);

        when(applicationRepository.findById("app-1")).thenReturn(Optional.of(app));
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.save(any())).thenReturn(app);

        jobService.updateApplicationStatus("app-1", RECRUITER_ID, "REJECTED");

        assertThat(app.getStatus()).isEqualTo(JobApplication.ApplicationStatus.REJECTED);
    }

    @Test
    @DisplayName("Update status — fails when not authorized recruiter")
    void updateApplicationStatus_NotAuthorized_ThrowsException() {
        JobApplication app = buildApplication("app-1", JobApplication.ApplicationStatus.APPLIED);

        when(applicationRepository.findById("app-1")).thenReturn(Optional.of(app));
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));

        assertThatThrownBy(() ->
                jobService.updateApplicationStatus("app-1", "wrong-recruiter", "SHORTLISTED"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Not authorized");

        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update status — fails when application not found")
    void updateApplicationStatus_ApplicationNotFound_ThrowsException() {
        when(applicationRepository.findById("bad-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                jobService.updateApplicationStatus("bad-id", RECRUITER_ID, "SHORTLISTED"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Application not found");
    }

    // ── Get Job Applicants ─────────────────────────────────

    @Test
    @DisplayName("Get job applicants — returns all applicants for recruiter")
    void getJobApplicants_Success() {
        List<JobApplication> apps = List.of(
                buildApplication("a1", JobApplication.ApplicationStatus.APPLIED),
                buildApplication("a2", JobApplication.ApplicationStatus.REVIEWING)
        );

        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.findByJobIdOrderByAppliedAtDesc(JOB_ID)).thenReturn(apps);

        List<ApplicationResponse> result = jobService.getJobApplicants(JOB_ID, RECRUITER_ID);

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Get job applicants — fails when not the recruiter")
    void getJobApplicants_NotAuthorized_ThrowsException() {
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(mockJob));

        assertThatThrownBy(() ->
                jobService.getJobApplicants(JOB_ID, "wrong-recruiter"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not the recruiter");
    }

    // ── My Posted Jobs ─────────────────────────────────────

    @Test
    @DisplayName("Get my posted jobs — returns all jobs for recruiter")
    void getMyPostedJobs_Success() {
        when(jobRepository.findByRecruiterIdOrderByCreatedAtDesc(RECRUITER_ID))
                .thenReturn(List.of(mockJob));

        List<JobResponse> result = jobService.getMyPostedJobs(RECRUITER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRecruiterId()).isEqualTo(RECRUITER_ID);
    }

    @Test
    @DisplayName("Get my posted jobs — returns empty list when no jobs posted")
    void getMyPostedJobs_ReturnsEmptyList() {
        when(jobRepository.findByRecruiterIdOrderByCreatedAtDesc(RECRUITER_ID))
                .thenReturn(List.of());

        List<JobResponse> result = jobService.getMyPostedJobs(RECRUITER_ID);

        assertThat(result).isEmpty();
    }
}