package com.drexcel.service;

import com.drexcel.config.JwtUtils;
import com.drexcel.dto.ChangePasswordRequest;
import com.drexcel.dto.LoginRequest;
import com.drexcel.dto.LoginResponse;
import com.drexcel.entity.Doctor;
import com.drexcel.entity.User;
import com.drexcel.exception.ResourceNotFoundException;
import com.drexcel.repository.DoctorRepository;
import com.drexcel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuditService auditService;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUsername()));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new BadCredentialsException("Account is deactivated");
        }

        String token = jwtUtils.generateToken(user.getUsername());

        Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
        String doctorName = doctor != null ? doctor.getName() : user.getUsername();
        Long doctorId = doctor != null ? doctor.getId() : null;

        auditService.log(user.getId(), "LOGIN", "USER", user.getId(), "User logged in successfully");

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole().name(),
                doctorName,
                doctorId
        );
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.log(user.getId(), "CHANGE_PASSWORD", "USER", user.getId(), "Password updated successfully");
    }
}
