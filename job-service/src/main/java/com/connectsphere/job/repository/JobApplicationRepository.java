package com.connectsphere.job.repository;

import com.connectsphere.job.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, String> {

    List<JobApplication> findByApplicantIdOrderByAppliedAtDesc(String applicantId);

    List<JobApplication> findByJobIdOrderByAppliedAtDesc(String jobId);

    boolean existsByJobIdAndApplicantId(String jobId, String applicantId);

    Optional<JobApplication> findByJobIdAndApplicantId(String jobId, String applicantId);
}