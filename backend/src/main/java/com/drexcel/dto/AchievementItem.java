package com.drexcel.dto;

import java.math.BigDecimal;

public record AchievementItem(
        Long doctorId,
        String doctorName,
        String workingStation,
        int cataractTarget,
        int achievementCount,
        BigDecimal achievementPercentage
) {
}
