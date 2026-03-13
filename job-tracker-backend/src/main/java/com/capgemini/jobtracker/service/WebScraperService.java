package com.capgemini.jobtracker.service;

import com.capgemini.jobtracker.model.dto.ScrapedJobDetails;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class WebScraperService {

    /**
     * Scrapes job details from a given URL.
     * Note: Selenium 4.6+ automatically manages the ChromeDriver binary,
     * so no manual setup or @PostConstruct method is required.
     */
    public ScrapedJobDetails scrapeJobDetails(String url) {
        WebDriver driver = null;
        try {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless=new"); // Runs without a UI window
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--remote-allow-origins=*");

            // Instantiating ChromeDriver triggers Selenium Manager internally
            driver = new ChromeDriver(options);
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
            driver.get(url);

            String pageTitle = driver.getTitle();
            String jobTitle = "Unknown Title";
            String companyName = "Unknown Company";

            // --- Heuristic 1: Parse the <title> tag ---
            if (pageTitle != null) {
                if (pageTitle.contains(" at ")) {
                    String[] parts = pageTitle.split(" at ");
                    jobTitle = parts[0].trim();
                    companyName = parts[1].split("\\|")[0].trim();
                } else if (pageTitle.contains("|")) {
                    String[] parts = pageTitle.split("\\|");
                    jobTitle = parts[0].trim();
                    if (parts.length > 1) {
                        companyName = parts[1].trim();
                    }
                } else if (pageTitle.contains("-")) {
                    String[] parts = pageTitle.split("-");
                    jobTitle = parts[0].trim();
                    if (parts.length > 1) {
                        companyName = parts[1].trim();
                    }
                } else {
                    jobTitle = pageTitle;
                }
            }

            // --- Heuristic 2: Refinement using common CSS selectors ---
            try {
                // Look for common LinkedIn/Indeed title and company selectors
                List<WebElement> titleElements = driver.findElements(By.cssSelector("h1.top-card-layout__title, .jobsearch-JobInfoHeader-title"));
                if (!titleElements.isEmpty()) {
                    jobTitle = titleElements.get(0).getText().trim();
                }

                List<WebElement> companyElements = driver.findElements(By.cssSelector("a.topcard__org-name-link, div.jobsearch-CompanyInfoContainer a"));
                if (!companyElements.isEmpty()) {
                    companyName = companyElements.get(0).getText().trim();
                }
            } catch (Exception ignored) {
                // Fallback to title heuristic if DOM parsing fails
            }

            return ScrapedJobDetails.builder()
                    .jobTitle(jobTitle)
                    .companyName(companyName)
                    .url(url)
                    .success(true)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ScrapedJobDetails.builder()
                    .url(url)
                    .success(false)
                    .errorMessage("Failed to scrape URL: " + e.getMessage())
                    .build();
        } finally {
            if (driver != null) {
                driver.quit(); // Critical: Quitting prevents memory leaks and hanging processes
            }
        }
    }
}