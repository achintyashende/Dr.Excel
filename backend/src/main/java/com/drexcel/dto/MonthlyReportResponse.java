package com.drexcel.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for a full monthly report with all sub-data.
 */
public record MonthlyReportResponse(
        Long reportId,
        Long doctorId,
        String doctorName,
        String workingStation,
        int month,
        int year,
        String status,
        LocalDateTime submittedAt,
        Patient40PlusRequest patient40Plus,
        OpdRequest opd,
        SchoolRequest school,
        ExtensionRequest extension,
        List<StudentRefractionRequest> studentRecords
) {
}
