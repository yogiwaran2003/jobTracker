package com.capgemini.jobtracker.service;

import com.capgemini.jobtracker.model.dto.ScrapedJobDetails;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.List;

@Service
public class WebScraperService {

    @PostConstruct
    public void setup() {
        // Setup ChromeDriver automatically depending on the OS browser version
        WebDriverManager.chromedriver().setup();
    }

    public ScrapedJobDetails scrapeJobDetails(String url) {
        WebDriver driver = null;
        try {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless=new"); // run headlessly, meaning no UI window will open
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--remote-allow-origins=*");
            
            driver = new ChromeDriver(options);
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
            driver.get(url);

            // A heuristic approach to find job title and company.
            // In a real production application, we'd have specific scrapers for LinkedIn, Indeed, etc.
            
            String pageTitle = driver.getTitle(); // E.g., "Software Engineer at Google | LinkedIn"
            String jobTitle = "Unknown Title";
            String companyName = "Unknown Company";

            // Basic Heuristic parsing based on common hyphenation or pipe splitting in `<title>`:
            if (pageTitle != null) {
                if (pageTitle.contains(" at ")) {
                    String[] parts = pageTitle.split(" at ");
                    jobTitle = parts[0].trim();
                    companyName = parts[1].split("\\|")[0].trim(); // Remove suffix like " | LinkedIn"
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
            
            // Refinement Using Common Class Names for popular boards (like LinkedIn)
            try {
                // Try finding common LinkedIn classes or similar
                List<WebElement> titleElements = driver.findElements(By.cssSelector("h1.top-card-layout__title, .jobsearch-JobInfoHeader-title"));
                if (!titleElements.isEmpty()) {
                    jobTitle = titleElements.get(0).getText().trim();
                }

                List<WebElement> companyElements = driver.findElements(By.cssSelector("a.topcard__org-name-link, div.jobsearch-CompanyInfoContainer a"));
                if (!companyElements.isEmpty()) {
                    companyName = companyElements.get(0).getText().trim();
                }
            } catch (Exception ignored) {
                // Ignore DOM exceptions, fallback to title heuristic
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
                driver.quit(); // Always quit to prevent memory leaks!
            }
        }
    }
}
