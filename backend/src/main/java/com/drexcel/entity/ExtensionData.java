package com.drexcel.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Sheet 4: C-Extension — Pre-operative, Post-operative, and Conversion visual acuity data.
 */
@Entity
@Table(name = "extension_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtensionData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false, unique = true)
    private MonthlyReport report;

    // Pre-operative VA
    @Column(name = "pre_va_lt_6_36")
    @Builder.Default
    private Integer preVaLt636 = 0;

    @Column(name = "pre_va_6_24_to_6_36")
    @Builder.Default
    private Integer preVa624To636 = 0;

    @Column(name = "pre_va_6_12_to_6_24")
    @Builder.Default
    private Integer preVa612To624 = 0;

    @Column(name = "pre_va_6_6_to_6_12")
    @Builder.Default
    private Integer preVa66To612 = 0;

    // Post-operative VA
    @Column(name = "post_va_lt_6_36")
    @Builder.Default
    private Integer postVaLt636 = 0;

    @Column(name = "post_va_6_24_to_6_36")
    @Builder.Default
    private Integer postVa624To636 = 0;

    @Column(name = "post_va_6_12_to_6_24")
    @Builder.Default
    private Integer postVa612To624 = 0;

    @Column(name = "post_va_6_6_to_6_12")
    @Builder.Default
    private Integer postVa66To612 = 0;

    // Conversion VA
    @Column(name = "conv_va_lt_6_36")
    @Builder.Default
    private Integer convVaLt636 = 0;

    @Column(name = "conv_va_6_24_to_6_36")
    @Builder.Default
    private Integer convVa624To636 = 0;

    @Column(name = "conv_va_6_12_to_6_24")
    @Builder.Default
    private Integer convVa612To624 = 0;

    @Column(name = "conv_va_6_6_to_6_12")
    @Builder.Default
    private Integer convVa66To612 = 0;
}
