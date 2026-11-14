package com.drexcel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Sheet 6: Camp programme entries — one entry per day of the month.
 */
@Entity
@Table(name = "camp_entries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"period_id", "day_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private ReportingPeriod period;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "weekday", length = 15)
    private String weekday;

    @Column(name = "hospital_name", length = 200)
    private String hospitalName;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "surgery_date")
    private LocalDate surgeryDate;

    @Column(name = "surgery_location", length = 200)
    private String surgeryLocation;
}
