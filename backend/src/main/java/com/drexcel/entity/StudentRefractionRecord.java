package com.drexcel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Sheet 5: Individual student refraction records.
 */
@Entity
@Table(name = "student_refraction_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRefractionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private MonthlyReport report;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "record_month")
    private LocalDate recordMonth;

    @Column(name = "headquarters", length = 100)
    private String headquarters;

    @Column(name = "block", length = 100)
    private String block;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "student_class", length = 20)
    private String studentClass;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender", length = 1)
    private String gender;

    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "guardian_contact", length = 50)
    private String guardianContact;

    @Column(name = "right_sph", length = 20)
    private String rightSph;

    @Column(name = "right_cyl", length = 20)
    private String rightCyl;

    @Column(name = "right_axis", length = 20)
    private String rightAxis;

    @Column(name = "right_va", length = 20)
    private String rightVa;

    @Column(name = "left_sph", length = 20)
    private String leftSph;

    @Column(name = "left_cyl", length = 20)
    private String leftCyl;

    @Column(name = "left_axis", length = 20)
    private String leftAxis;

    @Column(name = "left_va", length = 20)
    private String leftVa;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
