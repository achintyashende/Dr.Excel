package com.drexcel.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Sheet 2: OPD (Out-Patient Department) monthly report data.
 */
@Entity
@Table(name = "opd_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpdData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false, unique = true)
    private MonthlyReport report;

    @Column(name = "opd_patients_examined")
    @Builder.Default
    private Integer opdPatientsExamined = 0;

    @Column(name = "refractive_error")
    @Builder.Default
    private Integer refractiveError = 0;

    @Column(name = "cataract_found")
    @Builder.Default
    private Integer cataractFound = 0;

    @Column(name = "cataract_surgery")
    @Builder.Default
    private Integer cataractSurgery = 0;

    @Column(name = "cataract_waiting")
    @Builder.Default
    private Integer cataractWaiting = 0;

    @Column(name = "students_examined")
    @Builder.Default
    private Integer studentsExamined = 0;

    @Column(name = "students_with_re")
    @Builder.Default
    private Integer studentsWithRe = 0;

    @Column(name = "free_spectacles_provided")
    @Builder.Default
    private Integer freeSpectaclesProvided = 0;

    @Column(name = "diabetic_retinopathy")
    @Builder.Default
    private Integer diabeticRetinopathy = 0;

    @Column(name = "glaucoma")
    @Builder.Default
    private Integer glaucoma = 0;

    @Column(name = "squint")
    @Builder.Default
    private Integer squint = 0;

    @Column(name = "rop")
    @Builder.Default
    private Integer rop = 0;
}
