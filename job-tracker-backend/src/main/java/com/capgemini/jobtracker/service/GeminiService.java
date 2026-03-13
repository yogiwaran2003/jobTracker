package com.capgemini.jobtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.*;
import java.security.cert.X509Certificate;
import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService() {
        this.restTemplate = createInsecureRestTemplate();
    }

    private RestTemplate createInsecureRestTemplate() {
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() { return null; }
                        public void checkClientTrusted(X509Certificate[] certs, String authType) { }
                        public void checkServerTrusted(X509Certificate[] certs, String authType) { }
                    }
            };
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);

            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();

            // --- TIMEOUT UPDATES ---
            requestFactory.setConnectTimeout(15000); // 15 seconds to connect
            requestFactory.setReadTimeout(60000);    // 60 seconds to wait for AI to finish thinking

            return new RestTemplate(requestFactory);
        } catch (Exception e) {
            return new RestTemplate();
        }
    }

    // Updated to the version 2.5 flash which we confirmed is available for you
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

    public Map<String, Object> generateInterviewPrep(String jobTitle, String companyName, String jobDescription) {
        String prompt = buildPrompt(jobTitle, companyName, jobDescription);

        try {
            String url = GEMINI_URL + "?key=" + apiKey;

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            parts.add(part);
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseGeminiResponse(response.getBody());
            }

            return errorResponse("Gemini API returned status: " + response.getStatusCode());
        } catch (org.springframework.web.client.ResourceAccessException e) {
            return errorResponse("Timeout/Network error: The AI took too long to respond or the connection was reset. Details: " + e.getMessage());
        } catch (Exception e) {
            return errorResponse("Failed to call Gemini API: " + e.getMessage());
        }
    }

    private String buildPrompt(String jobTitle, String companyName, String jobDescription) {
        return """
            You are an expert career coach. Generate interview preparation material for the following job.
            
            Job Title: %s
            Company: %s
            Job Description: %s
            
            Return ONLY a valid JSON object. Do not include markdown formatting like ```json.
            Structure:
            {
              "technicalQuestions": [{"question": "string", "tip": "string"}],
              "behavioralQuestions": [{"question": "string", "tip": "string"}],
              "companyTips": ["string"],
              "keySkills": ["string"],
              "salaryRange": "string"
            }
            """.formatted(jobTitle, companyName,
                jobDescription != null && !jobDescription.isEmpty() ? jobDescription : "Not provided");
    }

    private Map<String, Object> parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String text = root.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text").asText().trim();

            // Better JSON cleaning logic
            if (text.contains("{")) {
                text = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
            }

            Map<String, Object> parsed = objectMapper.readValue(text, Map.class);
            parsed.put("success", true);
            return parsed;
        } catch (Exception e) {
            return errorResponse("Failed to parse AI response. The AI might have returned malformed data.");
        }
    }

    private Map<String, Object> errorResponse(String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("error", message);
        return result;
    }
}