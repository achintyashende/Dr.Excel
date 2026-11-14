package com.drexcel.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

/**
 * Request DTO for OPD report data (Sheet 2).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpdRequest {

    @Min(value = 0, message = "Value cannot be negative")
    private int opdPatientsExamined;

    @Min(value = 0, message = "Value cannot be negative")
    private int refractiveError;

    @Min(value = 0, message = "Value cannot be negative")
    private int cataractFound;

    @Min(value = 0, message = "Value cannot be negative")
    private int cataractSurgery;

    @Min(value = 0, message = "Value cannot be negative")
    private int cataractWaiting;

    @Min(value = 0, message = "Value cannot be negative")
    private int studentsExamined;

    @Min(value = 0, message = "Value cannot be negative")
    private int studentsWithRe;

    @Min(value = 0, message = "Value cannot be negative")
    private int freeSpectaclesProvided;

    @Min(value = 0, message = "Value cannot be negative")
    private int diabeticRetinopathy;

    @Min(value = 0, message = "Value cannot be negative")
    private int glaucoma;

    @Min(value = 0, message = "Value cannot be negative")
    private int squint;

    @Min(value = 0, message = "Value cannot be negative")
    private int rop;
}
