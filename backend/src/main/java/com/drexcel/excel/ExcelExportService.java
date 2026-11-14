package com.drexcel.excel;

import com.drexcel.entity.*;
import com.drexcel.exception.ResourceNotFoundException;
import com.drexcel.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final ReportingPeriodRepository reportingPeriodRepository;
    private final DoctorRepository doctorRepository;
    private final MonthlyReportRepository monthlyReportRepository;
    private final Patient40PlusDataRepository patient40PlusDataRepository;
    private final OpdDataRepository opdDataRepository;
    private final SchoolDataRepository schoolDataRepository;
    private final ExtensionDataRepository extensionDataRepository;
    private final StudentRefractionRecordRepository studentRefractionRecordRepository;
    private final CampEntryRepository campEntryRepository;
    private final CataractTargetRepository cataractTargetRepository;

    private static final String[] MONTH_NAMES = {
            "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    };

    @Transactional(readOnly = true)
    public byte[] generateWorkbook(int month, int year) {
        ReportingPeriod period = reportingPeriodRepository.findByMonthAndYear(month, year)
                .orElseThrow(() -> new ResourceNotFoundException("Reporting period not found for " + month + "/" + year));

        List<Doctor> doctors = doctorRepository.findAllByOrderByDisplayOrder();
        String monthName = MONTH_NAMES[month - 1];

        try (InputStream is = new ClassPathResource("templates/monthly_report_template.xlsx").getInputStream();
             Workbook workbook = WorkbookFactory.create(is);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // 1. Sheet 1: 40+ PATIENTS
            populate40PlusSheet(workbook, period, doctors, monthName, year);

            // 2. Sheet 2: OPD REPORT
            populateOpdSheet(workbook, period, doctors, monthName, year);

            // 3. Sheet 3: SCHOOL REPORT
            populateSchoolSheet(workbook, period, doctors, monthName, year);

            // 4. Sheet 4: C-EXTENSION
            populateExtensionSheet(workbook, period, doctors, monthName, year);

            // 5. Sheet 5: STUDENTS REFRACTION
            populateStudentsSheet(workbook, period);

            // 6. Sheet 6: CAMP PROGRAMME
            populateCampSheet(workbook, period, monthName, year);

            // 7. Sheet 7: ACHIEVEMENT
            populateAchievementSheet(workbook, period, doctors, monthName, year);

            workbook.setForceFormulaRecalculation(true);
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Excel export", e);
            throw new RuntimeException("Excel export generation failed: " + e.getMessage(), e);
        }
    }

    private void populate40PlusSheet(Workbook wb, ReportingPeriod period, List<Doctor> doctors, String monthName, int year) {
        Sheet sheet = wb.getSheet("1) 40+ PATIENTS");
        if (sheet == null) return;

        Row titleRow = sheet.getRow(2); // Row 3 in Excel
        if (titleRow != null && titleRow.getCell(0) != null) {
            titleRow.getCell(0).setCellValue("MONTH :- " + monthName + " " + year);
        }

        for (int i = 0; i < doctors.size(); i++) {
            Doctor doc = doctors.get(i);
            int rowIdx = 5 + i; // starts at row 6 (0-indexed 5)
            Row row = sheet.getRow(rowIdx);
            if (row == null) row = sheet.createRow(rowIdx);

            Optional<MonthlyReport> reportOpt = monthlyReportRepository.findByDoctorIdAndPeriodId(doc.getId(), period.getId());
            if (reportOpt.isPresent()) {
                Optional<Patient40PlusData> dataOpt = patient40PlusDataRepository.findByReportId(reportOpt.get().getId());
                if (dataOpt.isPresent()) {
                    Patient40PlusData d = dataOpt.get();
                    setCellValue(row, 2, d.getExaminedMale());
                    setCellValue(row, 3, d.getExaminedFemale());
                    setCellFormula(row, 4, "C" + (rowIdx + 1) + "+D" + (rowIdx + 1));
                    setCellValue(row, 5, d.getPresbyopiaMale());
                    setCellValue(row, 6, d.getPresbyopiaFemale());
                    setCellFormula(row, 7, "F" + (rowIdx + 1) + "+G" + (rowIdx + 1));
                    setCellValue(row, 8, d.getFreeSpectaclesMale());
                    setCellValue(row, 9, d.getFreeSpectaclesFemale());
                    setCellFormula(row, 10, "I" + (rowIdx + 1) + "+J" + (rowIdx + 1));
                }
            }
        }
    }

    private void populateOpdSheet(Workbook wb, ReportingPeriod period, List<Doctor> doctors, String monthName, int year) {
        Sheet sheet = wb.getSheet("2) OPD REPORT");
        if (sheet == null) return;

        for (int i = 0; i < doctors.size(); i++) {
            Doctor doc = doctors.get(i);
            int rowIdx = 5 + i;
            Row row = sheet.getRow(rowIdx);
            if (row == null) row = sheet.createRow(rowIdx);

            Optional<MonthlyReport> reportOpt = monthlyReportRepository.findByDoctorIdAndPeriodId(doc.getId(), period.getId());
            if (reportOpt.isPresent()) {
                Optional<OpdData> dataOpt = opdDataRepository.findByReportId(reportOpt.get().getId());
                if (dataOpt.isPresent()) {
                    OpdData d = dataOpt.get();
                    setCellValue(row, 2, d.getOpdPatientsExamined());
                    setCellValue(row, 3, d.getRefractiveError());
                    setCellValue(row, 4, d.getCataractFound());
                    setCellValue(row, 5, d.getCataractSurgery());
                    setCellValue(row, 6, d.getCataractWaiting());
                    setCellValue(row, 7, d.getStudentsExamined());
                    setCellValue(row, 8, d.getStudentsWithRe());
                    setCellValue(row, 9, d.getFreeSpectaclesProvided());
                    setCellValue(row, 10, d.getDiabeticRetinopathy());
                    setCellValue(row, 11, d.getGlaucoma());
                    setCellValue(row, 12, d.getSquint());
                    setCellValue(row, 13, d.getRop());
                }
            }
        }
    }

    private void populateSchoolSheet(Workbook wb, ReportingPeriod period, List<Doctor> doctors, String monthName, int year) {
        Sheet sheet = wb.getSheet("3) SCHOOL REPORT");
        if (sheet == null) return;

        Row titleRow = sheet.getRow(2);
        if (titleRow != null && titleRow.getCell(0) != null) {
            titleRow.getCell(0).setCellValue("MONTH :- " + monthName + " " + year);
        }

        for (int i = 0; i < doctors.size(); i++) {
            Doctor doc = doctors.get(i);
            int rowIdx = 6 + i; // starts at row 7 (index 6)
            Row row = sheet.getRow(rowIdx);
            if (row == null) row = sheet.createRow(rowIdx);

            Optional<MonthlyReport> reportOpt = monthlyReportRepository.findByDoctorIdAndPeriodId(doc.getId(), period.getId());
            if (reportOpt.isPresent()) {
                Optional<SchoolData> dataOpt = schoolDataRepository.findByReportId(reportOpt.get().getId());
                if (dataOpt.isPresent()) {
                    SchoolData d = dataOpt.get();
                    setCellValue(row, 2, d.getSchoolsExaminedMonth());
                    setCellValue(row, 3, d.getSchoolsExaminedMonth()); // progressive
                    setCellValue(row, 4, d.getStudentsMaleMonth());
                    setCellValue(row, 5, d.getStudentsFemaleMonth());
                    setCellFormula(row, 6, "E" + (rowIdx + 1) + "+F" + (rowIdx + 1));
                    setCellValue(row, 7, d.getStudentsMaleMonth()); // progressive male
                    setCellValue(row, 8, d.getStudentsFemaleMonth()); // progressive female
                    setCellFormula(row, 9, "H" + (rowIdx + 1) + "+I" + (rowIdx + 1));
                    setCellValue(row, 10, d.getRefractionMaleMonth());
                    setCellValue(row, 11, d.getRefractionFemaleMonth());
                    setCellFormula(row, 12, "K" + (rowIdx + 1) + "+L" + (rowIdx + 1));
                    setCellValue(row, 13, d.getRefractionMaleMonth());
                    setCellValue(row, 14, d.getRefractionFemaleMonth());
                    setCellFormula(row, 15, "N" + (rowIdx + 1) + "+O" + (rowIdx + 1));
                }
            }
        }
    }

    private void populateExtensionSheet(Workbook wb, ReportingPeriod period, List<Doctor> doctors, String monthName, int year) {
        Sheet sheet = wb.getSheet("4) C-EXTENSION");
        if (sheet == null) return;

        Row titleRow = sheet.getRow(2);
        if (titleRow != null && titleRow.getCell(2) != null) {
            titleRow.getCell(2).setCellValue("MONTH :- " + monthName + " " + year);
        }

        for (int i = 0; i < doctors.size(); i++) {
            Doctor doc = doctors.get(i);
            int rowIdx = 5 + i;
            Row row = sheet.getRow(rowIdx);
            if (row == null) row = sheet.createRow(rowIdx);

            Optional<MonthlyReport> reportOpt = monthlyReportRepository.findByDoctorIdAndPeriodId(doc.getId(), period.getId());
            if (reportOpt.isPresent()) {
                Optional<ExtensionData> dataOpt = extensionDataRepository.findByReportId(reportOpt.get().getId());
                if (dataOpt.isPresent()) {
                    ExtensionData d = dataOpt.get();
                    setCellValue(row, 6, d.getPreVaLt636());
                    setCellValue(row, 7, d.getPreVa624To636());
                    setCellValue(row, 8, d.getPreVa612To624());
                    setCellValue(row, 9, d.getPreVa66To612());

                    setCellValue(row, 11, d.getPostVaLt636());
                    setCellValue(row, 12, d.getPostVa624To636());
                    setCellValue(row, 13, d.getPostVa612To624());
                    setCellValue(row, 14, d.getPostVa66To612());

                    setCellValue(row, 16, d.getConvVaLt636());
                    setCellValue(row, 17, d.getConvVa624To636());
                    setCellValue(row, 18, d.getConvVa612To624());
                    setCellValue(row, 19, d.getConvVa66To612());
                }
            }
        }
    }

    private void populateStudentsSheet(Workbook wb, ReportingPeriod period) {
        Sheet sheet = wb.getSheet("5) STUDENTS REFRACTION");
        if (sheet == null) return;

        List<MonthlyReport> reports = monthlyReportRepository.findByPeriodId(period.getId());
        List<StudentRefractionRecord> records = new ArrayList<>();
        for (MonthlyReport report : reports) {
            records.addAll(studentRefractionRecordRepository.findByReportId(report.getId()));
        }

        // Clear existing sample rows from row 6 (index 5)
        int startRow = 5;
        for (int i = 0; i < records.size(); i++) {
            StudentRefractionRecord r = records.get(i);
            int rowIdx = startRow + i;
            Row row = sheet.getRow(rowIdx);
            if (row == null) row = sheet.createRow(rowIdx);

            setCellValue(row, 0, i + 1);
            setCellValue(row, 1, r.getAcademicYear() != null ? r.getAcademicYear() : "2026-27");
            setCellValue(row, 2, r.getRecordMonth() != null ? r.getRecordMonth().toString() : "");
            setCellValue(row, 3, r.getHeadquarters() != null ? r.getHeadquarters() : "");
            setCellValue(row, 4, r.getBlock() != null ? r.getBlock() : "");
            setCellValue(row, 5, r.getStudentName());
            setCellValue(row, 6, r.getStudentClass() != null ? r.getStudentClass() : "");
            if (r.getAge() != null) setCellValue(row, 7, r.getAge());
            setCellValue(row, 8, r.getGender() != null ? r.getGender() : "");
            setCellValue(row, 9, r.getSchoolName() != null ? r.getSchoolName() : "");
            setCellValue(row, 10, r.getGuardianContact() != null ? r.getGuardianContact() : "");

            setCellValue(row, 11, r.getRightSph() != null ? r.getRightSph() : "-");
            setCellValue(row, 12, r.getRightCyl() != null ? r.getRightCyl() : "-");
            setCellValue(row, 13, r.getRightAxis() != null ? r.getRightAxis() : "-");
            setCellValue(row, 14, r.getRightVa() != null ? r.getRightVa() : "6/6");

            setCellValue(row, 15, r.getLeftSph() != null ? r.getLeftSph() : "-");
            setCellValue(row, 16, r.getLeftCyl() != null ? r.getLeftCyl() : "-");
            setCellValue(row, 17, r.getLeftAxis() != null ? r.getLeftAxis() : "-");
            setCellValue(row, 18, r.getLeftVa() != null ? r.getLeftVa() : "6/6");
        }
    }

    private void populateCampSheet(Workbook wb, ReportingPeriod period, String monthName, int year) {
        Sheet sheet = wb.getSheet("6) CAMP PROGRAMME");
        if (sheet == null) return;

        List<CampEntry> entries = campEntryRepository.findByPeriodIdOrderByDayNumber(period.getId());
        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (CampEntry entry : entries) {
            int rowIdx = 10 + entry.getDayNumber(); // starts at row 12 (index 11) for day 1
            Row row = sheet.getRow(rowIdx);
            if (row == null) row = sheet.createRow(rowIdx);

            setCellValue(row, 0, entry.getDayNumber());
            setCellValue(row, 1, entry.getWeekday() != null ? entry.getWeekday() : "");
            setCellValue(row, 2, entry.getHospitalName() != null ? entry.getHospitalName() : "");
            if (entry.getAdmissionDate() != null) setCellValue(row, 3, entry.getAdmissionDate().format(df));
            if (entry.getSurgeryDate() != null) setCellValue(row, 4, entry.getSurgeryDate().format(df));
            setCellValue(row, 5, entry.getSurgeryLocation() != null ? entry.getSurgeryLocation() : "");
        }
    }

    private void populateAchievementSheet(Workbook wb, ReportingPeriod period, List<Doctor> doctors, String monthName, int year) {
        Sheet sheet = wb.getSheet("7) ACHIEVEMENT");
        if (sheet == null) return;

        for (int i = 0; i < doctors.size(); i++) {
            Doctor doc = doctors.get(i);
            int rowIdx = 4 + i; // starts at row 5 (index 4)
            Row row = sheet.getRow(rowIdx);
            if (row == null) row = sheet.createRow(rowIdx);

            int target = cataractTargetRepository.findByDoctorIdAndYearStart(doc.getId(), year)
                    .map(CataractTarget::getTargetCount)
                    .orElse(0);

            int achievement = 0;
            Optional<MonthlyReport> reportOpt = monthlyReportRepository.findByDoctorIdAndPeriodId(doc.getId(), period.getId());
            if (reportOpt.isPresent()) {
                Optional<OpdData> opd = opdDataRepository.findByReportId(reportOpt.get().getId());
                if (opd.isPresent()) {
                    achievement = opd.get().getCataractSurgery();
                }
            }

            setCellValue(row, 2, target);
            setCellValue(row, 3, achievement);

            BigDecimal pct = BigDecimal.ZERO;
            if (target > 0) {
                pct = BigDecimal.valueOf(achievement * 100.0 / target).setScale(2, RoundingMode.HALF_UP);
            }
            setCellValue(row, 4, pct.toPlainString() + " %");
        }
    }

    private void setCellValue(Row row, int colIndex, int value) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) cell = row.createCell(colIndex);
        cell.setCellValue(value);
    }

    private void setCellValue(Row row, int colIndex, String value) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) cell = row.createCell(colIndex);
        cell.setCellValue(value);
    }

    private void setCellFormula(Row row, int colIndex, String formula) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) cell = row.createCell(colIndex);
        cell.setCellFormula(formula);
    }
}
