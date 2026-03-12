package com.capgemini.jobtracker.service;

import com.capgemini.jobtracker.model.ApplicationStatus;
import com.capgemini.jobtracker.model.JobApplication;
import com.capgemini.jobtracker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobApplicationRepository repository;

    public List<JobApplication> getAllJobs() {
        return repository.findAll();
    }

    public JobApplication getJobById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    public JobApplication createJob(JobApplication job) {
        if (job.getStatus() == null) {
            job.setStatus(ApplicationStatus.WISHLIST);
        }
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
        return repository.save(job);
    }

    public void deleteJob(Long id) {
        repository.deleteById(id);
    }
}
