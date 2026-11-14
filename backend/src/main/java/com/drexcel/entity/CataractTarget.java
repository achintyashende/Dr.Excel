package com.drexcel.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Sheet 7: Annual cataract surgery targets per doctor.
 */
@Entity
@Table(name = "cataract_targets", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"doctor_id", "year_start"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CataractTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "year_start", nullable = false)
    private Integer yearStart;

    @Column(name = "target_count")
    @Builder.Default
    private Integer targetCount = 0;
}
