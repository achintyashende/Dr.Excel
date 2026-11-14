package com.drexcel.repository;

import com.drexcel.entity.ReportingPeriod;
import com.drexcel.entity.ReportingPeriod.PeriodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportingPeriodRepository extends JpaRepository<ReportingPeriod, Long> {

    Optional<ReportingPeriod> findByMonthAndYear(int month, int year);

    List<ReportingPeriod> findByStatus(PeriodStatus status);
}
