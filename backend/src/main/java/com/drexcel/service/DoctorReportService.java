package com.drexcel.service;

import com.drexcel.dto.*;
import com.drexcel.entity.*;
import com.drexcel.exception.ResourceNotFoundException;
import com.drexcel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorReportService {

    private final MonthlyReportRepository monthlyReportRepository;
    private final ReportingPeriodRepository reportingPeriodRepository;
    private final DoctorRepository doctorRepository;
    private final Patient40PlusDataRepository patient40PlusDataRepository;
    private final OpdDataRepository opdDataRepository;
    private final SchoolDataRepository schoolDataRepository;
    private final ExtensionDataRepository extensionDataRepository;
    private final StudentRefractionRecordRepository studentRefractionRecordRepository;
    private final AuditService auditService;

    @Transactional
    public MonthlyReport getOrCreateReport(Long doctorId, Long periodId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));
        ReportingPeriod period = reportingPeriodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found: " + periodId));

        return monthlyReportRepository.findByDoctorIdAndPeriodId(doctorId, periodId)
                .orElseGet(() -> {
                    MonthlyReport newReport = MonthlyReport.builder()
                            .doctor(doctor)
                            .period(period)
                            .status(MonthlyReport.ReportStatus.DRAFT)
                            .build();
                    return monthlyReportRepository.save(newReport);
                });
    }

    private MonthlyReport getDraftReportForDoctor(Long doctorId, Long periodId) {
        MonthlyReport report = getOrCreateReport(doctorId, periodId);
        if (!report.getDoctor().getId().equals(doctorId)) {
            throw new AccessDeniedException("You do not have permission to modify this report");
        }
        if (report.getStatus() != MonthlyReport.ReportStatus.DRAFT) {
            throw new IllegalStateException("This monthly report is already submitted and locked");
        }
        return report;
    }

    @Transactional
    public void savePatient40Plus(Long doctorId, Long periodId, Patient40PlusRequest req) {
        MonthlyReport report = getDraftReportForDoctor(doctorId, periodId);
        Patient40PlusData data = patient40PlusDataRepository.findByReportId(report.getId())
                .orElseGet(() -> Patient40PlusData.builder().report(report).build());

        data.setExaminedMale(req.getExaminedMale());
        data.setExaminedFemale(req.getExaminedFemale());
        data.setPresbyopiaMale(req.getPresbyopiaMale());
        data.setPresbyopiaFemale(req.getPresbyopiaFemale());
        data.setFreeSpectaclesMale(req.getFreeSpectaclesMale());
        data.setFreeSpectaclesFemale(req.getFreeSpectaclesFemale());

        patient40PlusDataRepository.save(data);
    }

    @Transactional
    public void saveOpd(Long doctorId, Long periodId, OpdRequest req) {
        MonthlyReport report = getDraftReportForDoctor(doctorId, periodId);
        OpdData data = opdDataRepository.findByReportId(report.getId())
                .orElseGet(() -> OpdData.builder().report(report).build());

        data.setOpdPatientsExamined(req.getOpdPatientsExamined());
        data.setRefractiveError(req.getRefractiveError());
        data.setCataractFound(req.getCataractFound());
        data.setCataractSurgery(req.getCataractSurgery());
        data.setCataractWaiting(req.getCataractWaiting());
        data.setStudentsExamined(req.getStudentsExamined());
        data.setStudentsWithRe(req.getStudentsWithRe());
        data.setFreeSpectaclesProvided(req.getFreeSpectaclesProvided());
        data.setDiabeticRetinopathy(req.getDiabeticRetinopathy());
        data.setGlaucoma(req.getGlaucoma());
        data.setSquint(req.getSquint());
        data.setRop(req.getRop());

        opdDataRepository.save(data);
    }

    @Transactional
    public void saveSchool(Long doctorId, Long periodId, SchoolRequest req) {
        MonthlyReport report = getDraftReportForDoctor(doctorId, periodId);
        SchoolData data = schoolDataRepository.findByReportId(report.getId())
                .orElseGet(() -> SchoolData.builder().report(report).build());

        data.setSchoolsExaminedMonth(req.getSchoolsExaminedMonth());
        data.setStudentsMaleMonth(req.getStudentsMaleMonth());
        data.setStudentsFemaleMonth(req.getStudentsFemaleMonth());
        data.setRefractionMaleMonth(req.getRefractionMaleMonth());
        data.setRefractionFemaleMonth(req.getRefractionFemaleMonth());

        schoolDataRepository.save(data);
    }

    @Transactional
    public void saveExtension(Long doctorId, Long periodId, ExtensionRequest req) {
        MonthlyReport report = getDraftReportForDoctor(doctorId, periodId);
        ExtensionData data = extensionDataRepository.findByReportId(report.getId())
                .orElseGet(() -> ExtensionData.builder().report(report).build());

        data.setPreVaLt636(req.getPreVaLt636());
        data.setPreVa624To636(req.getPreVa624To636());
        data.setPreVa612To624(req.getPreVa612To624());
        data.setPreVa66To612(req.getPreVa66To612());

        data.setPostVaLt636(req.getPostVaLt636());
        data.setPostVa624To636(req.getPostVa624To636());
        data.setPostVa612To624(req.getPostVa612To624());
        data.setPostVa66To612(req.getPostVa66To612());

        data.setConvVaLt636(req.getConvVaLt636());
        data.setConvVa624To636(req.getConvVa624To636());
        data.setConvVa612To624(req.getConvVa612To624());
        data.setConvVa66To612(req.getConvVa66To612());

        extensionDataRepository.save(data);
    }

    @Transactional
    public StudentRefractionRequest addStudentRecord(Long doctorId, Long periodId, StudentRefractionRequest req) {
        MonthlyReport report = getDraftReportForDoctor(doctorId, periodId);

        StudentRefractionRecord record = StudentRefractionRecord.builder()
                .report(report)
                .academicYear(req.getAcademicYear())
                .recordMonth(req.getRecordMonth())
                .headquarters(req.getHeadquarters())
                .block(req.getBlock())
                .studentName(req.getStudentName())
                .studentClass(req.getStudentClass())
                .age(req.getAge())
                .gender(req.getGender())
                .schoolName(req.getSchoolName())
                .guardianContact(req.getGuardianContact())
                .rightSph(req.getRightSph())
                .rightCyl(req.getRightCyl())
                .rightAxis(req.getRightAxis())
                .rightVa(req.getRightVa())
                .leftSph(req.getLeftSph())
                .leftCyl(req.getLeftCyl())
                .leftAxis(req.getLeftAxis())
                .leftVa(req.getLeftVa())
                .build();

        StudentRefractionRecord saved = studentRefractionRecordRepository.save(record);
        req.setId(saved.getId());
        return req;
    }

    @Transactional
    public StudentRefractionRequest updateStudentRecord(Long doctorId, Long periodId, Long studentId, StudentRefractionRequest req) {
        MonthlyReport report = getDraftReportForDoctor(doctorId, periodId);
        StudentRefractionRecord record = studentRefractionRecordRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found: " + studentId));

        if (!record.getReport().getId().equals(report.getId())) {
            throw new AccessDeniedException("This student record does not belong to your report");
        }

        record.setAcademicYear(req.getAcademicYear());
        record.setRecordMonth(req.getRecordMonth());
        record.setHeadquarters(req.getHeadquarters());
        record.setBlock(req.getBlock());
        record.setStudentName(req.getStudentName());
        record.setStudentClass(req.getStudentClass());
        record.setAge(req.getAge());
        record.setGender(req.getGender());
        record.setSchoolName(req.getSchoolName());
        record.setGuardianContact(req.getGuardianContact());
        record.setRightSph(req.getRightSph());
        record.setRightCyl(req.getRightCyl());
        record.setRightAxis(req.getRightAxis());
        record.setRightVa(req.getRightVa());
        record.setLeftSph(req.getLeftSph());
        record.setLeftCyl(req.getLeftCyl());
        record.setLeftAxis(req.getLeftAxis());
        record.setLeftVa(req.getLeftVa());

        studentRefractionRecordRepository.save(record);
        req.setId(record.getId());
        return req;
    }

    @Transactional
    public void deleteStudentRecord(Long doctorId, Long periodId, Long studentId) {
        MonthlyReport report = getDraftReportForDoctor(doctorId, periodId);
        StudentRefractionRecord record = studentRefractionRecordRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found: " + studentId));

        if (!record.getReport().getId().equals(report.getId())) {
            throw new AccessDeniedException("This student record does not belong to your report");
        }

        studentRefractionRecordRepository.delete(record);
    }

    @Transactional
    public void submitReport(Long doctorId, Long periodId) {
        MonthlyReport report = getDraftReportForDoctor(doctorId, periodId);

        // Cross-sheet validation
        OpdData opd = opdDataRepository.findByReportId(report.getId()).orElse(null);
        SchoolData school = schoolDataRepository.findByReportId(report.getId()).orElse(null);
        long studentRecordsCount = studentRefractionRecordRepository.countByReportId(report.getId());

        int opdExamined = (opd != null && opd.getStudentsExamined() != null) ? opd.getStudentsExamined() : 0;
        int opdWithRe = (opd != null && opd.getStudentsWithRe() != null) ? opd.getStudentsWithRe() : 0;

        int schoolMaleExamined = (school != null && school.getStudentsMaleMonth() != null) ? school.getStudentsMaleMonth() : 0;
        int schoolFemaleExamined = (school != null && school.getStudentsFemaleMonth() != null) ? school.getStudentsFemaleMonth() : 0;
        int schoolExaminedTotal = schoolMaleExamined + schoolFemaleExamined;

        int schoolMaleRefraction = (school != null && school.getRefractionMaleMonth() != null) ? school.getRefractionMaleMonth() : 0;
        int schoolFemaleRefraction = (school != null && school.getRefractionFemaleMonth() != null) ? school.getRefractionFemaleMonth() : 0;
        int schoolRefractionTotal = schoolMaleRefraction + schoolFemaleRefraction;

        if (opdExamined != schoolExaminedTotal) {
            throw new IllegalStateException(String.format(
                "Students Examined mismatch: OPD Report has %d, but School Report has %d (%d Male + %d Female). Both totals must be equal.",
                opdExamined, schoolExaminedTotal, schoolMaleExamined, schoolFemaleExamined
            ));
        }

        if (opdWithRe != schoolRefractionTotal) {
            throw new IllegalStateException(String.format(
                "Students with RE mismatch: OPD Report has %d, but School Report has %d (%d Male + %d Female). Both totals must be equal.",
                opdWithRe, schoolRefractionTotal, schoolMaleRefraction, schoolFemaleRefraction
            ));
        }

        if (studentRecordsCount != opdExamined) {
            throw new IllegalStateException(String.format(
                "Students Refraction records mismatch: Tab 5 has %d student records, but Students Examined is %d. Total records in Tab 5 must match Students Examined.",
                studentRecordsCount, opdExamined
            ));
        }

        report.setStatus(MonthlyReport.ReportStatus.SUBMITTED);
        report.setSubmittedAt(LocalDateTime.now());
        monthlyReportRepository.save(report);

        Long userId = report.getDoctor().getUser() != null ? report.getDoctor().getUser().getId() : null;
        auditService.log(userId, "SUBMIT_REPORT", "MONTHLY_REPORT", report.getId(),
                "Report submitted for period " + report.getPeriod().getMonth() + "/" + report.getPeriod().getYear());
    }

    @Transactional(readOnly = true)
    public MonthlyReportResponse getReport(Long doctorId, int month, int year) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));
        ReportingPeriod period = reportingPeriodRepository.findByMonthAndYear(month, year)
                .orElseThrow(() -> new ResourceNotFoundException("Reporting period not found for " + month + "/" + year));

        MonthlyReport report = monthlyReportRepository.findByDoctorIdAndPeriodId(doctorId, period.getId())
                .orElse(null);

        if (report == null) {
            return new MonthlyReportResponse(
                    null,
                    doctor.getId(),
                    doctor.getName(),
                    doctor.getWorkingStation(),
                    month,
                    year,
                    "NOT_STARTED",
                    null,
                    null,
                    null,
                    null,
                    null,
                    List.of()
            );
        }

        return mapToReportResponse(report);
    }

    @Transactional(readOnly = true)
    public List<MonthlyReportResponse> getHistory(Long doctorId) {
        List<MonthlyReport> reports = monthlyReportRepository.findByDoctorId(doctorId);
        return reports.stream().map(this::mapToReportResponse).collect(Collectors.toList());
    }

    public MonthlyReportResponse mapToReportResponse(MonthlyReport report) {
        Patient40PlusRequest p40 = patient40PlusDataRepository.findByReportId(report.getId())
                .map(d -> Patient40PlusRequest.builder()
                        .examinedMale(d.getExaminedMale())
                        .examinedFemale(d.getExaminedFemale())
                        .presbyopiaMale(d.getPresbyopiaMale())
                        .presbyopiaFemale(d.getPresbyopiaFemale())
                        .freeSpectaclesMale(d.getFreeSpectaclesMale())
                        .freeSpectaclesFemale(d.getFreeSpectaclesFemale())
                        .build())
                .orElse(null);

        OpdRequest opd = opdDataRepository.findByReportId(report.getId())
                .map(d -> OpdRequest.builder()
                        .opdPatientsExamined(d.getOpdPatientsExamined())
                        .refractiveError(d.getRefractiveError())
                        .cataractFound(d.getCataractFound())
                        .cataractSurgery(d.getCataractSurgery())
                        .cataractWaiting(d.getCataractWaiting())
                        .studentsExamined(d.getStudentsExamined())
                        .studentsWithRe(d.getStudentsWithRe())
                        .freeSpectaclesProvided(d.getFreeSpectaclesProvided())
                        .diabeticRetinopathy(d.getDiabeticRetinopathy())
                        .glaucoma(d.getGlaucoma())
                        .squint(d.getSquint())
                        .rop(d.getRop())
                        .build())
                .orElse(null);

        SchoolRequest school = schoolDataRepository.findByReportId(report.getId())
                .map(d -> SchoolRequest.builder()
                        .schoolsExaminedMonth(d.getSchoolsExaminedMonth())
                        .studentsMaleMonth(d.getStudentsMaleMonth())
                        .studentsFemaleMonth(d.getStudentsFemaleMonth())
                        .refractionMaleMonth(d.getRefractionMaleMonth())
                        .refractionFemaleMonth(d.getRefractionFemaleMonth())
                        .build())
                .orElse(null);

        ExtensionRequest ext = extensionDataRepository.findByReportId(report.getId())
                .map(d -> ExtensionRequest.builder()
                        .preVaLt636(d.getPreVaLt636())
                        .preVa624To636(d.getPreVa624To636())
                        .preVa612To624(d.getPreVa612To624())
                        .preVa66To612(d.getPreVa66To612())
                        .postVaLt636(d.getPostVaLt636())
                        .postVa624To636(d.getPostVa624To636())
                        .postVa612To624(d.getPostVa612To624())
                        .postVa66To612(d.getPostVa66To612())
                        .convVaLt636(d.getConvVaLt636())
                        .convVa624To636(d.getConvVa624To636())
                        .convVa612To624(d.getConvVa612To624())
                        .convVa66To612(d.getConvVa66To612())
                        .build())
                .orElse(null);

        List<StudentRefractionRequest> students = studentRefractionRecordRepository.findByReportId(report.getId())
                .stream()
                .map(s -> StudentRefractionRequest.builder()
                        .id(s.getId())
                        .academicYear(s.getAcademicYear())
                        .recordMonth(s.getRecordMonth())
                        .headquarters(s.getHeadquarters())
                        .block(s.getBlock())
                        .studentName(s.getStudentName())
                        .studentClass(s.getStudentClass())
                        .age(s.getAge())
                        .gender(s.getGender())
                        .schoolName(s.getSchoolName())
                        .guardianContact(s.getGuardianContact())
                        .rightSph(s.getRightSph())
                        .rightCyl(s.getRightCyl())
                        .rightAxis(s.getRightAxis())
                        .rightVa(s.getRightVa())
                        .leftSph(s.getLeftSph())
                        .leftCyl(s.getLeftCyl())
                        .leftAxis(s.getLeftAxis())
                        .leftVa(s.getLeftVa())
                        .build())
                .collect(Collectors.toList());

        return new MonthlyReportResponse(
                report.getId(),
                report.getDoctor().getId(),
                report.getDoctor().getName(),
                report.getDoctor().getWorkingStation(),
                report.getPeriod().getMonth(),
                report.getPeriod().getYear(),
                report.getStatus().name(),
                report.getSubmittedAt(),
                p40,
                opd,
                school,
                ext,
                students
        );
    }
}
