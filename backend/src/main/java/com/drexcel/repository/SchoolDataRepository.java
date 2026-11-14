package com.drexcel.repository;

import com.drexcel.entity.SchoolData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchoolDataRepository extends JpaRepository<SchoolData, Long> {

    Optional<SchoolData> findByReportId(Long reportId);
}
