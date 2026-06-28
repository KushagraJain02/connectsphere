package com.connectsphere.job.dto;

import com.connectsphere.job.entity.JobApplication;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {
    private String id;
    private String jobId;
    private String applicantId;
    private String applicantName;
    private String applicantEmail;
    private String coverLetter;
    private String resumeUrl;
    private String status;
    private LocalDateTime appliedAt;

    public static ApplicationResponse fromEntity(JobApplication app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .applicantId(app.getApplicantId())
                .applicantName(app.getApplicantName())
                .applicantEmail(app.getApplicantEmail())
                .coverLetter(app.getCoverLetter())
                .resumeUrl(app.getResumeUrl())
                .status(app.getStatus().name())
                .appliedAt(app.getAppliedAt())
                .build();
    }
}