package com.drexcel.controller;

import com.drexcel.dto.*;
import com.drexcel.entity.ReportingPeriod;
import com.drexcel.entity.User;
import com.drexcel.excel.ExcelExportService;
import com.drexcel.repository.UserRepository;
import com.drexcel.service.SeniorService;
import com.drexcel.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/senior")
@RequiredArgsConstructor
public class SeniorController {

    private final SeniorService seniorService;
    private final UserManagementService userManagementService;
    private final UserRepository userRepository;
    private final ExcelExportService excelExportService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam int month,
            @RequestParam int year
    ) {
        byte[] excelData = excelExportService.generateWorkbook(month, year);
        String filename = String.format("Monthly_Reports_%02d_%d.xlsx", month, year);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummary> getDashboard(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(seniorService.getDashboard(month, year));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<MonthlyReportResponse>> getAllReports(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(seniorService.getAllReports(month, year));
    }

    @GetMapping("/reports/{doctorId}")
    public ResponseEntity<MonthlyReportResponse> getDoctorReport(
            @PathVariable Long doctorId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(seniorService.getDoctorReport(doctorId, month, year));
    }

    @PutMapping("/camp/{periodId}")
    public ResponseEntity<ApiResponse> saveCampProgramme(
            @PathVariable Long periodId,
            @RequestBody List<CampEntryRequest> entries
    ) {
        seniorService.saveCampProgramme(periodId, entries);
        return ResponseEntity.ok(ApiResponse.success("Camp programme saved successfully"));
    }

    @GetMapping("/camp/{periodId}")
    public ResponseEntity<List<CampEntryRequest>> getCampProgramme(@PathVariable Long periodId) {
        return ResponseEntity.ok(seniorService.getCampProgramme(periodId));
    }

    @PutMapping("/targets/{year}")
    public ResponseEntity<ApiResponse> saveCataractTargets(
            @PathVariable int year,
            @RequestBody List<CataractTargetRequest> targets
    ) {
        seniorService.saveCataractTargets(year, targets);
        return ResponseEntity.ok(ApiResponse.success("Cataract targets saved successfully"));
    }

    @GetMapping("/achievement")
    public ResponseEntity<List<AchievementItem>> getAchievement(@RequestParam int year) {
        return ResponseEntity.ok(seniorService.getAchievementData(year));
    }

    @PostMapping("/reports/{reportId}/reopen")
    public ResponseEntity<ApiResponse> reopenReport(
            Authentication authentication,
            @PathVariable Long reportId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.getOrDefault("reason", "Requested by senior doctor") : "Requested by senior doctor";
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        Long userId = user != null ? user.getId() : null;

        seniorService.reopenReport(reportId, reason, userId);
        return ResponseEntity.ok(ApiResponse.success("Report reopened successfully"));
    }

    // User management
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listUsers() {
        return ResponseEntity.ok(userManagementService.listUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(userManagementService.createUser(request));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UserCreateRequest request
    ) {
        return ResponseEntity.ok(userManagementService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deactivateUser(@PathVariable Long id) {
        userManagementService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User blocked / deactivated successfully"));
    }

    @PostMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse> activateUser(@PathVariable Long id) {
        userManagementService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User access restored / activated successfully"));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@PathVariable Long id) {
        userManagementService.resetPassword(id);
        return ResponseEntity.ok(ApiResponse.success("Password reset to Doctor@123 successfully"));
    }

    // Reporting periods
    @GetMapping("/periods")
    public ResponseEntity<List<ReportingPeriod>> listPeriods() {
        return ResponseEntity.ok(userManagementService.listPeriods());
    }

    @PostMapping("/periods")
    public ResponseEntity<ReportingPeriod> createPeriod(@RequestBody Map<String, Integer> body) {
        int month = body.getOrDefault("month", 4);
        int year = body.getOrDefault("year", 2026);
        return ResponseEntity.ok(userManagementService.createPeriod(month, year));
    }

    @PutMapping("/periods/{id}/close")
    public ResponseEntity<ReportingPeriod> closePeriod(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.closePeriod(id));
    }

    @PutMapping("/periods/{id}/reopen")
    public ResponseEntity<ReportingPeriod> reopenPeriod(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.reopenPeriod(id));
    }
}
