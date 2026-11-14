package com.drexcel.repository;

import com.drexcel.entity.Patient40PlusData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface Patient40PlusDataRepository extends JpaRepository<Patient40PlusData, Long> {

    Optional<Patient40PlusData> findByReportId(Long reportId);
}
