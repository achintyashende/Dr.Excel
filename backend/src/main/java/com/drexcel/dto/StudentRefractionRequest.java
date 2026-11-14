package com.drexcel.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * Request DTO for an individual student refraction record (Sheet 5).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRefractionRequest {

    private Long id;
    private String academicYear;
    private LocalDate recordMonth;
    private String headquarters;
    private String block;
    private String studentName;
    private String studentClass;
    private Integer age;
    private String gender;
    private String schoolName;
    private String guardianContact;
    private String rightSph;
    private String rightCyl;
    private String rightAxis;
    private String rightVa;
    private String leftSph;
    private String leftCyl;
    private String leftAxis;
    private String leftVa;
}
