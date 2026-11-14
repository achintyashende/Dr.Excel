package com.drexcel.repository;

import com.drexcel.entity.CataractTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CataractTargetRepository extends JpaRepository<CataractTarget, Long> {

    Optional<CataractTarget> findByDoctorIdAndYearStart(Long doctorId, int yearStart);

    List<CataractTarget> findByYearStart(int yearStart);
}
