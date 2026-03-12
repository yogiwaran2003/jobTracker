package com.capgemini.jobtracker.controller;

import com.capgemini.jobtracker.model.ApplicationStatus;
import com.capgemini.jobtracker.model.JobApplication;
import com.capgemini.jobtracker.model.dto.ScrapedJobDetails;
import com.capgemini.jobtracker.service.JobService;
import com.capgemini.jobtracker.service.WebScraperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final WebScraperService webScraperService;

    @GetMapping
    public ResponseEntity<List<JobApplication>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PostMapping
    public ResponseEntity<JobApplication> createJob(@RequestBody JobApplication job) {
        return ResponseEntity.ok(jobService.createJob(job));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateJob(@PathVariable Long id, @RequestBody JobApplication jobDetails) {
        return ResponseEntity.ok(jobService.updateJob(id, jobDetails));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateJobStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        ApplicationStatus newStatus = ApplicationStatus.valueOf(payload.get("status").toUpperCase());
        return ResponseEntity.ok(jobService.updateJobStatus(id, newStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/scrape")
    public ResponseEntity<ScrapedJobDetails> scrapeJob(@RequestParam String url) {
        ScrapedJobDetails details = webScraperService.scrapeJobDetails(url);
        if (details.isSuccess()) {
            return ResponseEntity.ok(details);
        } else {
            return ResponseEntity.badRequest().body(details);
        }
    }
}
