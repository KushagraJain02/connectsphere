package com.connectsphere.job.repository;

import com.connectsphere.job.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, String> {

    Page<Job> findByStatusOrderByCreatedAtDesc(Job.JobStatus status, Pageable pageable);

    List<Job> findByRecruiterIdOrderByCreatedAtDesc(String recruiterId);

    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND " +
            "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")  // ← add this line
    Page<Job> searchJobs(String keyword, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Job j SET j.applicationCount = j.applicationCount + 1 WHERE j.id = :jobId")
    void incrementApplicationCount(String jobId);
}