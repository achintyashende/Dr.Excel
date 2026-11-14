package com.drexcel.service;

import com.drexcel.dto.UserCreateRequest;
import com.drexcel.dto.UserResponse;
import com.drexcel.entity.Doctor;
import com.drexcel.entity.ReportingPeriod;
import com.drexcel.entity.User;
import com.drexcel.exception.ResourceNotFoundException;
import com.drexcel.repository.DoctorRepository;
import com.drexcel.repository.ReportingPeriodRepository;
import com.drexcel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final ReportingPeriodRepository reportingPeriodRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(u -> {
            Doctor doc = doctorRepository.findByUserId(u.getId()).orElse(null);
            return new UserResponse(
                    u.getId(),
                    u.getUsername(),
                    u.getRole().name(),
                    Boolean.TRUE.equals(u.getActive()),
                    doc != null ? doc.getId() : null,
                    doc != null ? doc.getName() : null,
                    doc != null ? doc.getWorkingStation() : null,
                    doc != null ? doc.getBlock() : null,
                    doc != null ? doc.getFacilityType() : null,
                    u.getCreatedAt()
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalStateException("Username already taken: " + req.getUsername());
        }

        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.valueOf(req.getRole()))
                .active(true)
                .build();
        user = userRepository.save(user);

        Doctor doctor = null;
        if (req.getDoctorName() != null && !req.getDoctorName().isBlank()) {
            int nextOrder = (int) doctorRepository.count() + 1;
            doctor = Doctor.builder()
                    .user(user)
                    .name(req.getDoctorName())
                    .workingStation(req.getWorkingStation() != null ? req.getWorkingStation() : "HQ")
                    .block(req.getBlock())
                    .facilityType(req.getFacilityType())
                    .displayOrder(nextOrder)
                    .isVacant(false)
                    .build();
            doctor = doctorRepository.save(doctor);
        }

        auditService.log(user.getId(), "CREATE_USER", "USER", user.getId(), "Created user " + user.getUsername());

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                true,
                doctor != null ? doctor.getId() : null,
                doctor != null ? doctor.getName() : null,
                doctor != null ? doctor.getWorkingStation() : null,
                doctor != null ? doctor.getBlock() : null,
                doctor != null ? doctor.getFacilityType() : null,
                user.getCreatedAt()
        );
    }

    @Transactional
    public UserResponse updateUser(Long id, UserCreateRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (req.getRole() != null) {
            user.setRole(User.Role.valueOf(req.getRole()));
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }
        userRepository.save(user);

        Doctor doctor = doctorRepository.findByUserId(id).orElse(null);
        if (doctor != null) {
            if (req.getDoctorName() != null) doctor.setName(req.getDoctorName());
            if (req.getWorkingStation() != null) doctor.setWorkingStation(req.getWorkingStation());
            if (req.getBlock() != null) doctor.setBlock(req.getBlock());
            if (req.getFacilityType() != null) doctor.setFacilityType(req.getFacilityType());
            doctorRepository.save(doctor);
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                Boolean.TRUE.equals(user.getActive()),
                doctor != null ? doctor.getId() : null,
                doctor != null ? doctor.getName() : null,
                doctor != null ? doctor.getWorkingStation() : null,
                doctor != null ? doctor.getBlock() : null,
                doctor != null ? doctor.getFacilityType() : null,
                user.getCreatedAt()
        );
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setActive(false);
        userRepository.save(user);
        auditService.log(id, "DEACTIVATE_USER", "USER", id, "Account deactivated");
    }

    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setActive(true);
        userRepository.save(user);
        auditService.log(id, "ACTIVATE_USER", "USER", id, "Account reactivated / unblocked");
    }

    @Transactional
    public void resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setPasswordHash(passwordEncoder.encode("Doctor@123"));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<ReportingPeriod> listPeriods() {
        return reportingPeriodRepository.findAll();
    }

    @Transactional
    public ReportingPeriod createPeriod(int month, int year) {
        return reportingPeriodRepository.findByMonthAndYear(month, year)
                .orElseGet(() -> reportingPeriodRepository.save(ReportingPeriod.builder()
                        .month(month)
                        .year(year)
                        .status(ReportingPeriod.PeriodStatus.OPEN)
                        .openDate(LocalDate.of(year, month, 1))
                        .build()));
    }

    @Transactional
    public ReportingPeriod closePeriod(Long id) {
        ReportingPeriod period = reportingPeriodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found: " + id));
        period.setStatus(ReportingPeriod.PeriodStatus.CLOSED);
        period.setCloseDate(LocalDate.now());
        return reportingPeriodRepository.save(period);
    }

    @Transactional
    public ReportingPeriod reopenPeriod(Long id) {
        ReportingPeriod period = reportingPeriodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found: " + id));
        period.setStatus(ReportingPeriod.PeriodStatus.OPEN);
        period.setCloseDate(null);
        return reportingPeriodRepository.save(period);
    }
}
