package com.drexcel.repository;

import com.drexcel.entity.CampEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampEntryRepository extends JpaRepository<CampEntry, Long> {

    List<CampEntry> findByPeriodIdOrderByDayNumber(Long periodId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM CampEntry c WHERE c.period.id = :periodId")
    void deleteByPeriodId(@Param("periodId") Long periodId);
}
