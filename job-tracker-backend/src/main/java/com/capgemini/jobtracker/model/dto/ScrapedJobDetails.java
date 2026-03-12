package com.capgemini.jobtracker.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScrapedJobDetails {
    private String jobTitle;
    private String companyName;
    private String url;
    private boolean success;
    private String errorMessage;
}
