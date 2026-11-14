package com.drexcel.repository;

import com.drexcel.entity.OpdData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OpdDataRepository extends JpaRepository<OpdData, Long> {

    Optional<OpdData> findByReportId(Long reportId);
}
