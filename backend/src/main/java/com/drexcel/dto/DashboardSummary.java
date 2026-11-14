package com.drexcel.dto;

import java.util.List;

/**
 * Dashboard summary for the senior view.
 */
public record DashboardSummary(
        int totalDoctors,
        int submitted,
        int pending,
        List<DoctorSummaryItem> doctorSummaries
) {
}
