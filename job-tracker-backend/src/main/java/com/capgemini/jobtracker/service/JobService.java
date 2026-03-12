package com.capgemini.jobtracker.service;

import com.capgemini.jobtracker.model.ApplicationStatus;
import com.capgemini.jobtracker.model.JobApplication;
import com.capgemini.jobtracker.model.User;
import com.capgemini.jobtracker.repository.JobApplicationRepository;
import com.capgemini.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobApplicationRepository repository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<JobApplication> getAllJobs() {
        User user = getCurrentUser();
        if (user == null) return List.of();
        return repository.findByUser(user);
    }

    public JobApplication getJobById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    public JobApplication createJob(JobApplication job) {
        if (job.getStatus() == null) {
            job.setStatus(ApplicationStatus.WISHLIST);
        }
        User user = getCurrentUser();
        if (user == null) throw new RuntimeException("User not found. Please log in again.");
        job.setUser(user);
        return repository.save(job);
    }

    public JobApplication updateJobStatus(Long id, ApplicationStatus status) {
        JobApplication job = getJobById(id);
        job.setStatus(status);
        return repository.save(job);
    }

    public JobApplication updateJob(Long id, JobApplication jobDetails) {
        JobApplication job = getJobById(id);
        job.setCompanyName(jobDetails.getCompanyName());
        job.setJobTitle(jobDetails.getJobTitle());
        job.setUrl(jobDetails.getUrl());
        job.setStatus(jobDetails.getStatus() != null ? jobDetails.getStatus() : job.getStatus());
        job.setNotes(jobDetails.getNotes());
        job.setSalary(jobDetails.getSalary());
        return repository.save(job);
    }

    public void deleteJob(Long id) {
        repository.deleteById(id);
    }
}
