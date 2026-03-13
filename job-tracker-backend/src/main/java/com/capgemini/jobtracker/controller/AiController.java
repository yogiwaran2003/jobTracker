package com.capgemini.jobtracker.controller;

import com.capgemini.jobtracker.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
            String errorMsg = (String) result.get("error");
            // If it's a rate limit, return a 429 instead of a 500
            if (errorMsg != null && errorMsg.contains("429")) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(result);
            }
            return ResponseEntity.internalServerError().body(result);
        }
    }
}
