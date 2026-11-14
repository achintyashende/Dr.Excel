package com.drexcel.dto;

import lombok.*;

/**
 * Request DTO for setting cataract surgery target for a doctor (Sheet 7).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CataractTargetRequest {

    private Long doctorId;
    private int targetCount;
}
