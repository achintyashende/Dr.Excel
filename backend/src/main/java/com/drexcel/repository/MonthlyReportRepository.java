package com.drexcel.repository;

import com.drexcel.entity.MonthlyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Long> {

    Optional<MonthlyReport> findByDoctorIdAndPeriodId(Long doctorId, Long periodId);

    List<MonthlyReport> findByPeriodId(Long periodId);

    List<MonthlyReport> findByDoctorId(Long doctorId);
}
