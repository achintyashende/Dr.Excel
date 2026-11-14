package com.drexcel.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

/**
 * Request DTO for school screening data (Sheet 3).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolRequest {

    @Min(value = 0, message = "Value cannot be negative")
    private int schoolsExaminedMonth;

    @Min(value = 0, message = "Value cannot be negative")
    private int studentsMaleMonth;

    @Min(value = 0, message = "Value cannot be negative")
    private int studentsFemaleMonth;

    @Min(value = 0, message = "Value cannot be negative")
    private int refractionMaleMonth;

    @Min(value = 0, message = "Value cannot be negative")
    private int refractionFemaleMonth;
}
