package com.drexcel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Represents a doctor in the reporting system.
 */
@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "working_station", nullable = false, length = 150)
    private String workingStation;

    @Column(name = "block", length = 100)
    private String block;

    @Column(name = "facility_type", length = 20)
    private String facilityType;

    @Column(name = "is_vacant")
    @Builder.Default
    private Boolean isVacant = false;

    @Column(name = "deputed_to", length = 100)
    private String deputedTo;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
