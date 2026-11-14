package com.drexcel.controller;

import com.drexcel.dto.*;
import com.drexcel.entity.Doctor;
import com.drexcel.entity.User;
import com.drexcel.exception.ResourceNotFoundException;
import com.drexcel.repository.DoctorRepository;
import com.drexcel.repository.UserRepository;
import com.drexcel.service.DoctorReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorReportService doctorReportService;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    private Doctor getAuthenticatedDoctor(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AccessDeniedException("No doctor profile associated with user"));
    }

    @GetMapping("/profile")
    public ResponseEntity<Doctor> getProfile(Authentication authentication) {
        return ResponseEntity.ok(getAuthenticatedDoctor(authentication));
    }

    @GetMapping("/reports")
    public ResponseEntity<MonthlyReportResponse> getMyReport(
            Authentication authentication,
            @RequestParam int month,
            @RequestParam int year
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        return ResponseEntity.ok(doctorReportService.getReport(doctor.getId(), month, year));
    }

    @PutMapping("/reports/{periodId}/40plus")
    public ResponseEntity<ApiResponse> save40Plus(
            Authentication authentication,
            @PathVariable Long periodId,
            @Valid @RequestBody Patient40PlusRequest request
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        doctorReportService.savePatient40Plus(doctor.getId(), periodId, request);
        return ResponseEntity.ok(ApiResponse.success("40+ Patients data saved successfully"));
    }

    @PutMapping("/reports/{periodId}/opd")
    public ResponseEntity<ApiResponse> saveOpd(
            Authentication authentication,
            @PathVariable Long periodId,
            @Valid @RequestBody OpdRequest request
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        doctorReportService.saveOpd(doctor.getId(), periodId, request);
        return ResponseEntity.ok(ApiResponse.success("OPD data saved successfully"));
    }

    @PutMapping("/reports/{periodId}/school")
    public ResponseEntity<ApiResponse> saveSchool(
            Authentication authentication,
            @PathVariable Long periodId,
            @Valid @RequestBody SchoolRequest request
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        doctorReportService.saveSchool(doctor.getId(), periodId, request);
        return ResponseEntity.ok(ApiResponse.success("School data saved successfully"));
    }

    @PutMapping("/reports/{periodId}/extension")
    public ResponseEntity<ApiResponse> saveExtension(
            Authentication authentication,
            @PathVariable Long periodId,
            @Valid @RequestBody ExtensionRequest request
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        doctorReportService.saveExtension(doctor.getId(), periodId, request);
        return ResponseEntity.ok(ApiResponse.success("C-Extension data saved successfully"));
    }

    @PostMapping("/reports/{periodId}/students")
    public ResponseEntity<StudentRefractionRequest> addStudentRecord(
            Authentication authentication,
            @PathVariable Long periodId,
            @Valid @RequestBody StudentRefractionRequest request
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        return ResponseEntity.ok(doctorReportService.addStudentRecord(doctor.getId(), periodId, request));
    }

    @PutMapping("/reports/{periodId}/students/{studentId}")
    public ResponseEntity<StudentRefractionRequest> updateStudentRecord(
            Authentication authentication,
            @PathVariable Long periodId,
            @PathVariable Long studentId,
            @Valid @RequestBody StudentRefractionRequest request
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        return ResponseEntity.ok(doctorReportService.updateStudentRecord(doctor.getId(), periodId, studentId, request));
    }

    @DeleteMapping("/reports/{periodId}/students/{studentId}")
    public ResponseEntity<ApiResponse> deleteStudentRecord(
            Authentication authentication,
            @PathVariable Long periodId,
            @PathVariable Long studentId
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        doctorReportService.deleteStudentRecord(doctor.getId(), periodId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student record deleted successfully"));
    }

    @PostMapping("/reports/{periodId}/submit")
    public ResponseEntity<ApiResponse> submitReport(
            Authentication authentication,
            @PathVariable Long periodId
    ) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        doctorReportService.submitReport(doctor.getId(), periodId);
        return ResponseEntity.ok(ApiResponse.success("Monthly report submitted and locked successfully"));
    }

    @GetMapping("/reports/history")
    public ResponseEntity<List<MonthlyReportResponse>> getHistory(Authentication authentication) {
        Doctor doctor = getAuthenticatedDoctor(authentication);
        return ResponseEntity.ok(doctorReportService.getHistory(doctor.getId()));
    }
}
