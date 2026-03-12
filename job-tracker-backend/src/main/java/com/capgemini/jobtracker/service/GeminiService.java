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

    private RestTemplate restTemplate;
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
            requestFactory.setConnectTimeout(10000);
            requestFactory.setReadTimeout(10000);
            return new RestTemplate(requestFactory);
        } catch (Exception e) {
            return new RestTemplate(); // Fallback
        }
    }

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public Map<String, Object> generateInterviewPrep(String jobTitle, String companyName, String jobDescription) {
        String prompt = buildPrompt(jobTitle, companyName, jobDescription);

        try {
            String url = GEMINI_URL + "?key=" + apiKey;

            // Build request body
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
            return errorResponse("Network error: Could not connect to Gemini API. If you are on a corporate VPN (like Zscaler), it might be blocking the request or intercepting SSL certificates. Details: " + e.getMessage());
        } catch (Exception e) {
            return errorResponse("Failed to call Gemini API: " + e.getMessage() + " (" + e.getClass().getSimpleName() + ")");
        }
    }

    private String buildPrompt(String jobTitle, String companyName, String jobDescription) {
        return """
            You are an expert career coach. Generate interview preparation material for the following job.
            
            Job Title: %s
            Company: %s
            Job Description: %s
            
            Please provide your response in the following JSON format exactly (no markdown, no code blocks, just raw JSON):
            {
              "technicalQuestions": [
                {"question": "...", "tip": "Brief tip on how to answer this"}
              ],
              "behavioralQuestions": [
                {"question": "...", "tip": "Brief tip on how to answer this"}
              ],
              "companyTips": ["tip1", "tip2", "tip3"],
              "keySkills": ["skill1", "skill2", "skill3"],
              "salaryRange": "Expected salary range based on the role and company"
            }
            
            Generate exactly 5 technical questions, 4 behavioral questions, 3 company-specific tips, 
            5 key skills to highlight, and a salary estimate.
            Return ONLY valid JSON, no additional text.
            """.formatted(jobTitle, companyName, 
                    jobDescription != null && !jobDescription.isEmpty() ? jobDescription : "Not provided");
    }

    private Map<String, Object> parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text");
            
            String text = textNode.asText().trim();
            
            // Clean up - remove Markdown code blocks if present
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            text = text.trim();

            Map<String, Object> parsed = objectMapper.readValue(text, Map.class);
            parsed.put("success", true);
            return parsed;
        } catch (Exception e) {
            return errorResponse("Failed to parse AI response: " + e.getMessage());
        }
    }

    private Map<String, Object> errorResponse(String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("error", message);
        return result;
    }
}
