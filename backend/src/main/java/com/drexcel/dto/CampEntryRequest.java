package com.drexcel.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * Request DTO for a camp programme entry (Sheet 6).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampEntryRequest {

    private int dayNumber;
    private String weekday;
    private String hospitalName;
    private LocalDate admissionDate;
    private LocalDate surgeryDate;
    private String surgeryLocation;
}
