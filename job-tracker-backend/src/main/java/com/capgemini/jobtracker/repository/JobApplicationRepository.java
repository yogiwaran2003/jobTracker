package com.capgemini.jobtracker.repository;

import com.capgemini.jobtracker.model.JobApplication;
import com.capgemini.jobtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUser(User user);
}
