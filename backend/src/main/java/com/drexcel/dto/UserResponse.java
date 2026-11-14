package com.drexcel.dto;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String role,
        boolean active,
        Long doctorId,
        String doctorName,
        String workingStation,
        String block,
        String facilityType,
        LocalDateTime createdAt
) {
}
