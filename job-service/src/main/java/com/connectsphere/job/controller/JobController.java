package com.connectsphere.job.controller;

import com.connectsphere.job.dto.*;
import com.connectsphere.job.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // Recruiter posts a job
    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @RequestHeader("X-User-Id") String recruiterId,
            @RequestHeader(value = "X-User-Name", required = false) String recruiterName,
            @RequestHeader(value = "X-User-Email", required = false) String recruiterEmail,
            @Valid @RequestBody CreateJobRequest request) {
        String name = (recruiterName != null && !recruiterName.isBlank())
                ? recruiterName : recruiterEmail;
        return ResponseEntity.ok(jobService.createJob(recruiterId, name, request));
    }

    // Get all open jobs
    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobService.getAllJobs(userId, page, size));
    }

    // Search jobs by keyword
    @GetMapping("/search")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam String keyword,
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, userId, page, size));
    }

    // Get single job
    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJob(
            @PathVariable String jobId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(jobService.getJob(jobId, userId));
    }

    // Get my posted jobs (recruiter)
    @GetMapping("/my/posted")
    public ResponseEntity<List<JobResponse>> getMyPostedJobs(
            @RequestHeader("X-User-Id") String recruiterId) {
        return ResponseEntity.ok(jobService.getMyPostedJobs(recruiterId));
    }

    // Apply for a job
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<ApplicationResponse> applyForJob(
            @PathVariable String jobId,
            @RequestHeader("X-User-Id") String applicantId,
            @RequestHeader(value = "X-User-Name", required = false) String applicantName,
            @RequestHeader(value = "X-User-Email", required = false) String applicantEmail,
            @RequestBody ApplyJobRequest request) {
        String name = (applicantName != null && !applicantName.isBlank())
                ? applicantName : applicantEmail;
        return ResponseEntity.ok(jobService.applyForJob(
                jobId, applicantId, name, applicantEmail, request));
    }

    // Get my applications (user)
    @GetMapping("/my/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @RequestHeader("X-User-Id") String applicantId) {
        return ResponseEntity.ok(jobService.getMyApplications(applicantId));
    }

    // Get all applicants for a job (recruiter)
    @GetMapping("/{jobId}/applicants")
    public ResponseEntity<List<ApplicationResponse>> getJobApplicants(
            @PathVariable String jobId,
            @RequestHeader("X-User-Id") String recruiterId) {
        return ResponseEntity.ok(jobService.getJobApplicants(jobId, recruiterId));
    }

    // Update application status (recruiter)
    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable String applicationId,
            @RequestHeader("X-User-Id") String recruiterId,
            @RequestParam String status) {
        return ResponseEntity.ok(jobService.updateApplicationStatus(
                applicationId, recruiterId, status));
    }

    // Close a job
    @PutMapping("/{jobId}/close")
    public ResponseEntity<JobResponse> closeJob(
            @PathVariable String jobId,
            @RequestHeader("X-User-Id") String recruiterId) {
        return ResponseEntity.ok(jobService.closeJob(jobId, recruiterId));
    }

    // Delete a job
    @DeleteMapping("/{jobId}")
    public ResponseEntity<String> deleteJob(
            @PathVariable String jobId,
            @RequestHeader("X-User-Id") String recruiterId) {
        jobService.deleteJob(jobId, recruiterId);
        return ResponseEntity.ok("Job deleted successfully");
    }
}