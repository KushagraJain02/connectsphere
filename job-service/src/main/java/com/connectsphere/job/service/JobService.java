package com.connectsphere.job.service;

import com.connectsphere.job.dto.*;
import com.connectsphere.job.entity.*;
import com.connectsphere.job.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final KafkaTemplate<String, Map<String, Object>> kafkaTemplate;

    public JobResponse createJob(String recruiterId, String recruiterName,
                                 CreateJobRequest request) {
        Job job = Job.builder()
                .recruiterId(recruiterId)
                .recruiterName(recruiterName)
                .companyName(request.getCompanyName())
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .salaryRange(request.getSalaryRange())
                .requiredSkills(request.getRequiredSkills())
                .build();

        return JobResponse.fromEntity(jobRepository.save(job), false);
    }

    public Page<JobResponse> getAllJobs(String userId, int page, int size) {
        return jobRepository.findByStatusOrderByCreatedAtDesc(
                        Job.JobStatus.OPEN, PageRequest.of(page, size))
                .map(job -> JobResponse.fromEntity(job,
                        applicationRepository.existsByJobIdAndApplicantId(job.getId(), userId)));
    }

    public Page<JobResponse> searchJobs(String keyword, String userId, int page, int size) {
        return jobRepository.searchJobs(keyword, PageRequest.of(page, size))
                .map(job -> JobResponse.fromEntity(job,
                        applicationRepository.existsByJobIdAndApplicantId(job.getId(), userId)));
    }

    public JobResponse getJob(String jobId, String userId) {
        Job job = findJobById(jobId);
        return JobResponse.fromEntity(job,
                applicationRepository.existsByJobIdAndApplicantId(jobId, userId));
    }

    public List<JobResponse> getMyPostedJobs(String recruiterId) {
        return jobRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId)
                .stream()
                .map(job -> JobResponse.fromEntity(job, false))
                .collect(Collectors.toList());
    }

    public ApplicationResponse applyForJob(String jobId, String applicantId,
                                           String applicantName, String applicantEmail,
                                           ApplyJobRequest request) {
        Job job = findJobById(jobId);

        if (job.getStatus() == Job.JobStatus.CLOSED) {
            throw new RuntimeException("Job is closed");
        }

        if (applicationRepository.existsByJobIdAndApplicantId(jobId, applicantId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        JobApplication application = JobApplication.builder()
                .jobId(jobId)
                .applicantId(applicantId)
                .applicantName(applicantName)
                .applicantEmail(applicantEmail)
                .coverLetter(request.getCoverLetter())
                .resumeUrl(request.getResumeUrl())
                .status(JobApplication.ApplicationStatus.APPLIED)
                .build();

        applicationRepository.save(application);
        jobRepository.incrementApplicationCount(jobId);

        // Notify recruiter via Kafka
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "JOB_APPLIED");
        event.put("jobId", jobId);
        event.put("jobTitle", job.getTitle());
        event.put("recruiterId", job.getRecruiterId());
        event.put("applicantId", applicantId);
        event.put("applicantName", applicantName);
        kafkaTemplate.send("job-events", event);

        return ApplicationResponse.fromEntity(application);
    }

    public List<ApplicationResponse> getMyApplications(String applicantId) {
        return applicationRepository.findByApplicantIdOrderByAppliedAtDesc(applicantId)
                .stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getJobApplicants(String jobId, String recruiterId) {
        Job job = findJobById(jobId);

        if (!job.getRecruiterId().equals(recruiterId)) {
            throw new RuntimeException("You are not the recruiter for this job");
        }

        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId)
                .stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ApplicationResponse updateApplicationStatus(String applicationId,
                                                       String recruiterId,
                                                       String newStatus) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Job job = findJobById(application.getJobId());

        if (!job.getRecruiterId().equals(recruiterId)) {
            throw new RuntimeException("Not authorized");
        }

        application.setStatus(JobApplication.ApplicationStatus.valueOf(newStatus));

        // Notify applicant via Kafka
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "APPLICATION_STATUS_UPDATED");
        event.put("jobId", application.getJobId());
        event.put("jobTitle", job.getTitle());
        event.put("applicantId", application.getApplicantId());
        event.put("recruiterId", recruiterId);
        event.put("status", newStatus);
        kafkaTemplate.send("job-events", event);

        return ApplicationResponse.fromEntity(applicationRepository.save(application));
    }

    public JobResponse closeJob(String jobId, String recruiterId) {
        Job job = findJobById(jobId);

        if (!job.getRecruiterId().equals(recruiterId)) {
            throw new RuntimeException("Not authorized to close this job");
        }

        job.setStatus(Job.JobStatus.CLOSED);
        return JobResponse.fromEntity(jobRepository.save(job), false);
    }

    public void deleteJob(String jobId, String recruiterId) {
        Job job = findJobById(jobId);

        if (!job.getRecruiterId().equals(recruiterId)) {
            throw new RuntimeException("Not authorized to delete this job");
        }

        jobRepository.delete(job);
    }

    private Job findJobById(String jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
    }
}