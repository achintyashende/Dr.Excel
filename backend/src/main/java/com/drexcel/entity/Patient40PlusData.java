package com.drexcel.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Sheet 1: 40+ Patients examination data.
 */
@Entity
@Table(name = "patient_40plus_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient40PlusData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false, unique = true)
    private MonthlyReport report;

    @Column(name = "examined_male")
    @Builder.Default
    private Integer examinedMale = 0;

    @Column(name = "examined_female")
    @Builder.Default
    private Integer examinedFemale = 0;

    @Column(name = "presbyopia_male")
    @Builder.Default
    private Integer presbyopiaMale = 0;

    @Column(name = "presbyopia_female")
    @Builder.Default
    private Integer presbyopiaFemale = 0;

    @Column(name = "free_spectacles_male")
    @Builder.Default
    private Integer freeSpectaclesMale = 0;

    @Column(name = "free_spectacles_female")
    @Builder.Default
    private Integer freeSpectaclesFemale = 0;

    /**
     * Total examined (male + female).
     */
    public int getTotalExamined() {
        return (examinedMale != null ? examinedMale : 0) + (examinedFemale != null ? examinedFemale : 0);
    }

    /**
     * Total presbyopia cases (male + female).
     */
    public int getTotalPresbyopia() {
        return (presbyopiaMale != null ? presbyopiaMale : 0) + (presbyopiaFemale != null ? presbyopiaFemale : 0);
    }

    /**
     * Total free spectacles given (male + female).
     */
    public int getTotalFreeSpectacles() {
        return (freeSpectaclesMale != null ? freeSpectaclesMale : 0) + (freeSpectaclesFemale != null ? freeSpectaclesFemale : 0);
    }
}
