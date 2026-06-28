package com.connectsphere.job.dto;

import com.connectsphere.job.entity.Job;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class JobResponse {
    private String id;
    private String recruiterId;
    private String recruiterName;
    private String companyName;
    private String title;
    private String description;
    private String location;
    private String jobType;
    private String experienceLevel;
    private String salaryRange;
    private List<String> requiredSkills;
    private String status;
    private int applicationCount;
    private boolean alreadyApplied;
    private LocalDateTime createdAt;

    public static JobResponse fromEntity(Job job, boolean alreadyApplied) {
        return JobResponse.builder()
                .id(job.getId())
                .recruiterId(job.getRecruiterId())
                .recruiterName(job.getRecruiterName())
                .companyName(job.getCompanyName())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .salaryRange(job.getSalaryRange())
                .requiredSkills(job.getRequiredSkills())
                .status(job.getStatus().name())
                .applicationCount(job.getApplicationCount())
                .alreadyApplied(alreadyApplied)
                .createdAt(job.getCreatedAt())
                .build();
    }
}