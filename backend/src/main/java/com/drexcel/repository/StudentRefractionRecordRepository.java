package com.drexcel.repository;

import com.drexcel.entity.StudentRefractionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRefractionRecordRepository extends JpaRepository<StudentRefractionRecord, Long> {

    List<StudentRefractionRecord> findByReportId(Long reportId);

    long countByReportId(Long reportId);

    void deleteByIdAndReportId(Long id, Long reportId);
}
