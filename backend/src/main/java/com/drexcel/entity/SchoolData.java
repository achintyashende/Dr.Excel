package com.drexcel.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Sheet 3: School screening report data (monthly values).
 */
@Entity
@Table(name = "school_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false, unique = true)
    private MonthlyReport report;

    @Column(name = "schools_examined_month")
    @Builder.Default
    private Integer schoolsExaminedMonth = 0;

    @Column(name = "students_male_month")
    @Builder.Default
    private Integer studentsMaleMonth = 0;

    @Column(name = "students_female_month")
    @Builder.Default
    private Integer studentsFemaleMonth = 0;

    @Column(name = "refraction_male_month")
    @Builder.Default
    private Integer refractionMaleMonth = 0;

    @Column(name = "refraction_female_month")
    @Builder.Default
    private Integer refractionFemaleMonth = 0;
}
