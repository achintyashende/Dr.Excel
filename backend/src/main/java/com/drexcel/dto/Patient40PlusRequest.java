package com.drexcel.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

/**
 * Request DTO for 40+ patient examination data (Sheet 1).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient40PlusRequest {

    @Min(value = 0, message = "Value cannot be negative")
    private int examinedMale;

    @Min(value = 0, message = "Value cannot be negative")
    private int examinedFemale;

    @Min(value = 0, message = "Value cannot be negative")
    private int presbyopiaMale;

    @Min(value = 0, message = "Value cannot be negative")
    private int presbyopiaFemale;

    @Min(value = 0, message = "Value cannot be negative")
    private int freeSpectaclesMale;

    @Min(value = 0, message = "Value cannot be negative")
    private int freeSpectaclesFemale;
}
