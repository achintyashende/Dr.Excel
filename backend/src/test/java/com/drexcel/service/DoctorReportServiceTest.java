package com.drexcel.service;

import com.drexcel.entity.*;
import com.drexcel.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorReportServiceTest {

    @Mock
    private MonthlyReportRepository monthlyReportRepository;
    @Mock
    private ReportingPeriodRepository reportingPeriodRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private Patient40PlusDataRepository patient40PlusDataRepository;
    @Mock
    private OpdDataRepository opdDataRepository;
    @Mock
    private SchoolDataRepository schoolDataRepository;
    @Mock
    private ExtensionDataRepository extensionDataRepository;
    @Mock
    private StudentRefractionRecordRepository studentRefractionRecordRepository;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private DoctorReportService doctorReportService;

    private Doctor doctor;
    private ReportingPeriod period;
    private MonthlyReport draftReport;

    @BeforeEach
    void setUp() {
        doctor = Doctor.builder()
                .id(1L)
                .name("Dr. Test")
                .workingStation("Test Station")
                .user(User.builder().id(10L).username("dr.test").build())
                .build();

        period = ReportingPeriod.builder()
                .id(100L)
                .month(4)
                .year(2026)
                .build();

        draftReport = MonthlyReport.builder()
                .id(500L)
                .doctor(doctor)
                .period(period)
                .status(MonthlyReport.ReportStatus.DRAFT)
                .build();

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(reportingPeriodRepository.findById(100L)).thenReturn(Optional.of(period));
        when(monthlyReportRepository.findByDoctorIdAndPeriodId(1L, 100L)).thenReturn(Optional.of(draftReport));
    }

    @Test
    @DisplayName("Should throw error when OPD studentsExamined does not match School Report total students")
    void shouldThrowErrorWhenStudentsExaminedMismatch() {
        OpdData opd = OpdData.builder()
                .report(draftReport)
                .studentsExamined(50)
                .studentsWithRe(10)
                .build();

        SchoolData school = SchoolData.builder()
                .report(draftReport)
                .studentsMaleMonth(20)
                .studentsFemaleMonth(25) // Total = 45 != 50
                .refractionMaleMonth(5)
                .refractionFemaleMonth(5) // Total = 10 == 10
                .build();

        when(opdDataRepository.findByReportId(500L)).thenReturn(Optional.of(opd));
        when(schoolDataRepository.findByReportId(500L)).thenReturn(Optional.of(school));
        when(studentRefractionRecordRepository.countByReportId(500L)).thenReturn(50L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                doctorReportService.submitReport(1L, 100L)
        );

        assertTrue(ex.getMessage().contains("Students Examined mismatch"));
        verify(monthlyReportRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw error when OPD studentsWithRe does not match School Report total refraction")
    void shouldThrowErrorWhenStudentsWithReMismatch() {
        OpdData opd = OpdData.builder()
                .report(draftReport)
                .studentsExamined(50)
                .studentsWithRe(12) // != 10
                .build();

        SchoolData school = SchoolData.builder()
                .report(draftReport)
                .studentsMaleMonth(25)
                .studentsFemaleMonth(25) // Total = 50 == 50
                .refractionMaleMonth(5)
                .refractionFemaleMonth(5) // Total = 10
                .build();

        when(opdDataRepository.findByReportId(500L)).thenReturn(Optional.of(opd));
        when(schoolDataRepository.findByReportId(500L)).thenReturn(Optional.of(school));
        when(studentRefractionRecordRepository.countByReportId(500L)).thenReturn(50L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                doctorReportService.submitReport(1L, 100L)
        );

        assertTrue(ex.getMessage().contains("Students with RE mismatch"));
        verify(monthlyReportRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw error when Tab 5 student records count does not match Students Examined")
    void shouldThrowErrorWhenStudentRecordsCountMismatch() {
        OpdData opd = OpdData.builder()
                .report(draftReport)
                .studentsExamined(50)
                .studentsWithRe(10)
                .build();

        SchoolData school = SchoolData.builder()
                .report(draftReport)
                .studentsMaleMonth(25)
                .studentsFemaleMonth(25) // Total = 50
                .refractionMaleMonth(5)
                .refractionFemaleMonth(5) // Total = 10
                .build();

        when(opdDataRepository.findByReportId(500L)).thenReturn(Optional.of(opd));
        when(schoolDataRepository.findByReportId(500L)).thenReturn(Optional.of(school));
        when(studentRefractionRecordRepository.countByReportId(500L)).thenReturn(48L); // 48 != 50

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                doctorReportService.submitReport(1L, 100L)
        );

        assertTrue(ex.getMessage().contains("Students Refraction records mismatch"));
        verify(monthlyReportRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should successfully submit when all cross-sheet totals match")
    void shouldSuccessfullySubmitWhenAllMatch() {
        OpdData opd = OpdData.builder()
                .report(draftReport)
                .studentsExamined(50)
                .studentsWithRe(10)
                .build();

        SchoolData school = SchoolData.builder()
                .report(draftReport)
                .studentsMaleMonth(25)
                .studentsFemaleMonth(25) // Total = 50 == 50
                .refractionMaleMonth(6)
                .refractionFemaleMonth(4) // Total = 10 == 10
                .build();

        when(opdDataRepository.findByReportId(500L)).thenReturn(Optional.of(opd));
        when(schoolDataRepository.findByReportId(500L)).thenReturn(Optional.of(school));
        when(studentRefractionRecordRepository.countByReportId(500L)).thenReturn(50L); // 50 == 50
        when(monthlyReportRepository.save(any(MonthlyReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> doctorReportService.submitReport(1L, 100L));

        assertEquals(MonthlyReport.ReportStatus.SUBMITTED, draftReport.getStatus());
        assertNotNull(draftReport.getSubmittedAt());
        verify(monthlyReportRepository, times(1)).save(draftReport);
        verify(auditService, times(1)).log(eq(10L), eq("SUBMIT_REPORT"), eq("MONTHLY_REPORT"), eq(500L), any());
    }
}
