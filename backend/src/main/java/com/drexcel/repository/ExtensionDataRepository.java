package com.drexcel.repository;

import com.drexcel.entity.ExtensionData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExtensionDataRepository extends JpaRepository<ExtensionData, Long> {

    Optional<ExtensionData> findByReportId(Long reportId);
}
