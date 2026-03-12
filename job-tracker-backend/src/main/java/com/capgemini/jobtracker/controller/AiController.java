package com.capgemini.jobtracker.controller;

import com.capgemini.jobtracker.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/interview-prep")
    public ResponseEntity<Map<String, Object>> generateInterviewPrep(@RequestBody Map<String, String> request) {
        String jobTitle = request.getOrDefault("jobTitle", "Software Engineer");
        String companyName = request.getOrDefault("companyName", "Unknown Company");
        String jobDescription = request.getOrDefault("jobDescription", "");

        Map<String, Object> result = geminiService.generateInterviewPrep(jobTitle, companyName, jobDescription);

        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.internalServerError().body(result);
        }
    }
}
