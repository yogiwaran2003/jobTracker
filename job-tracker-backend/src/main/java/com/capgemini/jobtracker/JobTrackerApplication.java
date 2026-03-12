package com.capgemini.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class JobTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobTrackerApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedOrigins("job-tracker-jkhj9omvb-s-yogeswarans-projects.vercel.app")
						.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
			}
		};
	}
}
