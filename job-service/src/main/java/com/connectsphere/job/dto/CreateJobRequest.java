package com.connectsphere.job.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateJobRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String location;
    private String jobType;
    private String experienceLevel;
    private String salaryRange;
    private List<String> requiredSkills;
}