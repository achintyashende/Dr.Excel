package com.drexcel.dto;

/**
 * Response DTO for successful login.
 */
public record LoginResponse(
        String token,
        String username,
        String role,
        String doctorName,
        Long doctorId
) {
}
