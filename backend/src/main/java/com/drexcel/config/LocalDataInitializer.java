package com.drexcel.config;

import com.drexcel.entity.*;
import com.drexcel.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final ReportingPeriodRepository reportingPeriodRepository;
    private final CataractTargetRepository cataractTargetRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data load.");
            return;
        }

        log.info("Seeding initial data for local development...");

        // 1. Create Senior Doctor account
        User seniorUser = userRepository.save(User.builder()
                .username("kh.bhatkar")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role(User.Role.SENIOR)
                .active(true)
                .build());

        // 2. Create sample Doctor account
        User doctorUser = userRepository.save(User.builder()
                .username("kiran.chavan")
                .passwordHash(passwordEncoder.encode("Doctor@123"))
                .role(User.Role.DOCTOR)
                .active(true)
                .build());

        // 3. Create all 25 doctors matching Excel
        record DocSeed(String name, String station, String block, String type, boolean vacant, String deputed, Integer userIdx, int target) {}

        List<DocSeed> seedList = List.of(
                new DocSeed("KIRAN CHAVAN", "R.H DHAMNGAON RAILWAY", "DHAMGAON RLY", "R.H", false, null, 2, 181),
                new DocSeed("KAMINI KHADSE", "R.H CHANDUR RAILWAY", "CHANDUR RLY", "R.H", false, null, null, 163),
                new DocSeed("MILIND SURYAWANSHI", "R.H NANDGAON KHANDESHWAR", "NANDGAON KH", "RH", false, null, null, 335),
                new DocSeed("VANITA GOURKHEDE", "SDH DARYAPUR", "DARYAPUR", "SDH", false, null, null, 238),
                new DocSeed("VACANT BUT KAMINI KHADSE DEPUTED", "R.H.TIOSA", "TIOSA", "R.H", true, "KAMINI KHADSE", null, 25),
                new DocSeed("ARTI CAHVHAN", "R.H.ANJANGAON SURJI", "ANJANGAON SURJI", "R.H", false, null, null, 393),
                new DocSeed("VACANT", "PHC LONI WARUD", "WARUD", "PHC", true, null, null, 0),
                new DocSeed("W.A.GANORKAR", "R.H.CHANDUR BAZAR", "CHANDUR BZ.", "R.H", false, null, null, 211),
                new DocSeed("VACANT", "R.H.WARUD", "WARUD", "R.H", true, null, null, 0),
                new DocSeed("K.H.BHATKAR", "PHC KURHA", "TIOSA", "PHC", false, null, 1, 187),
                new DocSeed("P.M.YAWLE", "R.H.BHATKULI", "BHATKULI", "R.H", false, null, null, 249),
                new DocSeed("SUMIT MANOHARE", "PHC WALGAON", "AMRAVATI", "PHC", false, null, null, 305),
                new DocSeed("RAMBHAU TAYDE", "PHC YEODA", "DARYAPUR", "PHC", false, null, null, 147),
                new DocSeed("VACANT", "DWH AMRAVATI", "AMRAVATI", "DWH", true, null, null, 0),
                new DocSeed("AMIT SHINDE (Contractual)", "DH AMRAVATI", "AMRAVATI", "DH", false, null, null, 306),
                new DocSeed("NITIN KALAMKAR", "DH AMRAVATI", "AMRAVATI", "DH", false, null, null, 0),
                new DocSeed("ZOHEF RAJA", "PHC DHAMANGAON GADHI", "ACHALPUR", "PHC", false, null, null, 215),
                new DocSeed("VIVEK SONTAKKE", "SDH DHARNI", "DHARNI", "SDH", false, null, null, 152),
                new DocSeed("PRIYANKA CHALAK", "PHC BIJUDHAWADI", "DHARNI", "PHC", false, null, null, 339),
                new DocSeed("RUSHIKESH OZA", "RH CHIKHALDARA", "CHIKHALDARA", "RH", false, null, null, 109),
                new DocSeed("EJAZ SHAHA", "RH CHURNI", "CHIKHALDARA", "RH", false, null, null, 0),
                new DocSeed("SHARAYU GONDANE", "PHC SEMADOH", "CHIKHALDARA", "PHC", false, null, null, 0),
                new DocSeed("SUVARNA LANDGE (Contractual)", "SDH ACHALPUR", "ACHALPUR", "SDH", false, null, null, 0),
                new DocSeed("VACANT", "SDH MORSHI", "MORSHI", "SDH", true, null, null, 0),
                new DocSeed("VEDANT GONDIK", "PHC KARAJGAON", "CHANDUR BZ.", "PHC", false, null, null, 0)
        );

        for (int i = 0; i < seedList.size(); i++) {
            DocSeed s = seedList.get(i);
            User user = null;
            if (s.userIdx != null) {
                user = s.userIdx == 1 ? seniorUser : doctorUser;
            }

            Doctor doc = doctorRepository.save(Doctor.builder()
                    .user(user)
                    .name(s.name)
                    .workingStation(s.station)
                    .block(s.block)
                    .facilityType(s.type)
                    .isVacant(s.vacant)
                    .deputedTo(s.deputed)
                    .displayOrder(i + 1)
                    .build());

            if (s.target > 0) {
                cataractTargetRepository.save(CataractTarget.builder()
                        .doctor(doc)
                        .yearStart(2026)
                        .targetCount(s.target)
                        .build());
            }
        }

        // 4. Create active reporting period for April 2026
        reportingPeriodRepository.save(ReportingPeriod.builder()
                .month(4)
                .year(2026)
                .status(ReportingPeriod.PeriodStatus.OPEN)
                .openDate(LocalDate.of(2026, 4, 1))
                .build());

        log.info("Local development seed data loaded successfully! 25 doctors, 2 users, April 2026 period ready.");
    }
}
