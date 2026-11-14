package com.drexcel.dto;

/**
 * Summary item for a single doctor in the dashboard.
 */
public record DoctorSummaryItem(
        Long doctorId,
        String name,
        String workingStation,
        String status,
        int opdCount,
        int cataractSurgery
) {
}
