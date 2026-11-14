package com.drexcel.service;

import com.drexcel.dto.*;
import com.drexcel.entity.*;
import com.drexcel.exception.ResourceNotFoundException;
import com.drexcel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SeniorService {

    private final DoctorRepository doctorRepository;
    private final ReportingPeriodRepository reportingPeriodRepository;
    private final MonthlyReportRepository monthlyReportRepository;
    private final OpdDataRepository opdDataRepository;
    private final CampEntryRepository campEntryRepository;
    private final CataractTargetRepository cataractTargetRepository;
    private final DoctorReportService doctorReportService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public DashboardSummary getDashboard(int month, int year) {
        ReportingPeriod period = reportingPeriodRepository.findByMonthAndYear(month, year).orElse(null);
        List<Doctor> doctors = doctorRepository.findAllByOrderByDisplayOrder();

        int submittedCount = 0;
        int pendingCount = 0;
        List<DoctorSummaryItem> items = new ArrayList<>();

        for (Doctor doctor : doctors) {
            String status = "PENDING";
            int opdCount = 0;
            int cataractSurgery = 0;

            if (period != null) {
                Optional<MonthlyReport> reportOpt = monthlyReportRepository.findByDoctorIdAndPeriodId(doctor.getId(), period.getId());
                if (reportOpt.isPresent()) {
                    MonthlyReport report = reportOpt.get();
                    status = report.getStatus().name();
                    if (report.getStatus() == MonthlyReport.ReportStatus.SUBMITTED) {
                        submittedCount++;
                    } else {
                        pendingCount++;
                    }

                    Optional<OpdData> opdOpt = opdDataRepository.findByReportId(report.getId());
                    if (opdOpt.isPresent()) {
                        opdCount = opdOpt.get().getOpdPatientsExamined();
                        cataractSurgery = opdOpt.get().getCataractSurgery();
                    }
                } else {
                    pendingCount++;
                }
            } else {
                pendingCount++;
            }

            items.add(new DoctorSummaryItem(
                    doctor.getId(),
                    doctor.getName(),
                    doctor.getWorkingStation(),
                    status,
                    opdCount,
                    cataractSurgery
            ));
        }

        return new DashboardSummary(doctors.size(), submittedCount, pendingCount, items);
    }

    @Transactional(readOnly = true)
    public List<MonthlyReportResponse> getAllReports(int month, int year) {
        ReportingPeriod period = reportingPeriodRepository.findByMonthAndYear(month, year)
                .orElseThrow(() -> new ResourceNotFoundException("Reporting period not found for " + month + "/" + year));

        List<Doctor> doctors = doctorRepository.findAllByOrderByDisplayOrder();
        List<MonthlyReportResponse> responses = new ArrayList<>();

        for (Doctor doc : doctors) {
            responses.add(doctorReportService.getReport(doc.getId(), month, year));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public MonthlyReportResponse getDoctorReport(Long doctorId, int month, int year) {
        return doctorReportService.getReport(doctorId, month, year);
    }

    @Transactional
    public void saveCampProgramme(Long periodId, List<CampEntryRequest> entries) {
        ReportingPeriod period = reportingPeriodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporting period not found: " + periodId));

        // Delete existing entries immediately and flush so deletes execute before new inserts
        campEntryRepository.deleteByPeriodId(periodId);
        campEntryRepository.flush();

        if (entries == null || entries.isEmpty()) {
            return;
        }

        // Deduplicate and ensure valid unique day numbers to satisfy unique constraint
        Set<Integer> usedDays = new HashSet<>();
        List<CampEntry> campEntries = new ArrayList<>();
        int autoDay = 1;

        for (CampEntryRequest e : entries) {
            int day = (e.getDayNumber() > 0) ? e.getDayNumber() : autoDay;
            while (usedDays.contains(day)) {
                day++;
            }
            usedDays.add(day);
            autoDay = day + 1;

            campEntries.add(CampEntry.builder()
                    .period(period)
                    .dayNumber(day)
                    .weekday(e.getWeekday() != null && !e.getWeekday().isBlank() ? e.getWeekday().toUpperCase() : "MONDAY")
                    .hospitalName(e.getHospitalName())
                    .admissionDate(e.getAdmissionDate())
                    .surgeryDate(e.getSurgeryDate())
                    .surgeryLocation(e.getSurgeryLocation())
                    .build()
            );
        }

        campEntryRepository.saveAll(campEntries);
    }

    @Transactional(readOnly = true)
    public List<CampEntryRequest> getCampProgramme(Long periodId) {
        return campEntryRepository.findByPeriodIdOrderByDayNumber(periodId).stream()
                .map(c -> CampEntryRequest.builder()
                        .dayNumber(c.getDayNumber())
                        .weekday(c.getWeekday())
                        .hospitalName(c.getHospitalName())
                        .admissionDate(c.getAdmissionDate())
                        .surgeryDate(c.getSurgeryDate())
                        .surgeryLocation(c.getSurgeryLocation())
                        .build())
                .toList();
    }

    @Transactional
    public void saveCataractTargets(int year, List<CataractTargetRequest> targets) {
        for (CataractTargetRequest req : targets) {
            Doctor doctor = doctorRepository.findById(req.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + req.getDoctorId()));

            CataractTarget target = cataractTargetRepository.findByDoctorIdAndYearStart(doctor.getId(), year)
                    .orElseGet(() -> CataractTarget.builder()
                            .doctor(doctor)
                            .yearStart(year)
                            .build());

            target.setTargetCount(req.getTargetCount());
            cataractTargetRepository.save(target);
        }
    }

    @Transactional(readOnly = true)
    public List<AchievementItem> getAchievementData(int year) {
        List<Doctor> doctors = doctorRepository.findAllByOrderByDisplayOrder();
        List<AchievementItem> items = new ArrayList<>();

        for (Doctor doctor : doctors) {
            int target = cataractTargetRepository.findByDoctorIdAndYearStart(doctor.getId(), year)
                    .map(CataractTarget::getTargetCount)
                    .orElse(0);

            // Sum cataract surgeries from doctor's submitted reports in this year
            List<MonthlyReport> reports = monthlyReportRepository.findByDoctorId(doctor.getId());
            int achievement = 0;
            for (MonthlyReport report : reports) {
                if (report.getPeriod().getYear() == year) {
                    Optional<OpdData> opd = opdDataRepository.findByReportId(report.getId());
                    if (opd.isPresent()) {
                        achievement += opd.get().getCataractSurgery();
                    }
                }
            }

            BigDecimal percentage = BigDecimal.ZERO;
            if (target > 0) {
                percentage = BigDecimal.valueOf(achievement * 100.0 / target).setScale(2, RoundingMode.HALF_UP);
            }

            items.add(new AchievementItem(
                    doctor.getId(),
                    doctor.getName(),
                    doctor.getWorkingStation(),
                    target,
                    achievement,
                    percentage
            ));
        }

        return items;
    }

    @Transactional
    public void reopenReport(Long reportId, String reason, Long seniorUserId) {
        MonthlyReport report = monthlyReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        report.setStatus(MonthlyReport.ReportStatus.DRAFT);
        report.setSubmittedAt(null);
        monthlyReportRepository.save(report);

        auditService.log(seniorUserId, "REOPEN_REPORT", "MONTHLY_REPORT", reportId, "Report reopened. Reason: " + reason);
    }
}
