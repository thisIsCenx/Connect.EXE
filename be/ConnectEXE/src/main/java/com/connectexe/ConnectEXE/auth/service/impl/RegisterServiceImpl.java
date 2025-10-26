package com.connectexe.ConnectEXE.auth.service.impl;

import com.connectexe.ConnectEXE.auth.dto.request.RegisterRequest;
import com.connectexe.ConnectEXE.auth.dto.response.RegisterResponse;
import com.connectexe.ConnectEXE.auth.service.MailService;
import com.connectexe.ConnectEXE.auth.service.RegisterService;
import com.connectexe.ConnectEXE.common.constant.MessageConst;
import com.connectexe.ConnectEXE.common.constant.CommonConst;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.entity.OtpCode;
import com.connectexe.ConnectEXE.repository.UserRepository;
import com.connectexe.ConnectEXE.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import com.connectexe.ConnectEXE.util.IdUtil;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Implementation for handling registration operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class RegisterServiceImpl implements RegisterService {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final MailService mailService;

    /**
     * Registers a new user and sends a verification email.
     *
     * @param request the registration request containing user details
     * @return the registration response with a success message
     * @throws IllegalArgumentException if the email or phone number is already used
     */
    @Override
    public RegisterResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        boolean emailUsed = userRepository.existsByEmail(request.getEmail());
    boolean phoneUsed = userRepository.existsByPhoneNumber(request.getPhoneNumber());
    boolean identityCardUsed = userRepository.existsByIdentityCard(request.getIdentityCard());

        if (emailUsed || phoneUsed || identityCardUsed) {
            log.warn("Registration failed - Email used: {}, Phone used: {}, Identity card used: {}",
                    emailUsed, phoneUsed, identityCardUsed);
            return RegisterResponse.builder()
                    .message(MessageConst.MSG_REGISTER_INFO_USED)
                    .emailUsed(emailUsed)
                    .phoneUsed(phoneUsed)
                    .identityCardUsed(identityCardUsed)
                    .build();
        }

    // Tạo user mới
        User user = new User();
    // Generate DB-compatible userId (12 hex chars)
    user.setUserId(IdUtil.randomHex(12));
    user.setPassword(new BCryptPasswordEncoder().encode(request.getPassword()));
    user.setFullName(request.getFullName());
    // some fields from RegisterRequest may not exist on User entity (dateOfBirth, gender, address)
    // Only set fields that exist on User
    user.setIdentityNumber(request.getIdentityCard());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhoneNumber());
    // Align role with DB default values (student/teacher/admin)
    user.setRole("student");
    user.setIsActive(true);
    user.setIsVerified(false);

        try {
            userRepository.save(user);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
        // Handle race conditions where uniqueness is enforced at DB level
        boolean emailUsed2 = userRepository.existsByEmail(request.getEmail());
        boolean phoneUsed2 = userRepository.existsByPhoneNumber(request.getPhoneNumber());
        boolean identityCardUsed2 = userRepository.existsByIdentityCard(request.getIdentityCard());
        log.warn("Registration failed due to DB constraint - Email used: {}, Phone used: {}, Identity card used: {}",
            emailUsed2, phoneUsed2, identityCardUsed2);
        return RegisterResponse.builder()
            .message(MessageConst.MSG_REGISTER_INFO_USED)
            .emailUsed(emailUsed2)
            .phoneUsed(phoneUsed2)
            .identityCardUsed(identityCardUsed2)
            .build();
    }

    // create a simple token for the newly registered user. Replace with proper token generation (JWT) later.
    String token = UUID.randomUUID().toString();

    return RegisterResponse.builder()
        .message(MessageConst.MSG_REGISTER_SUCCESS)
        .emailUsed(false)
        .phoneUsed(false)
        .identityCardUsed(false)
        .userId(user.getUserId())
        .token(token)
        .build();
    }

    /**
     * Verifies a user's email with a verification code.
     *
     * @param email the user's email
     * @param code  the verification code
     * @return a response map indicating success or failure with detailed message
     */
    @Override
    public Map<String, Object> verifyCode(String email, String code) {
        Map<String, Object> response = new HashMap<>();
        log.info("Verifying code for email: {}", email);

    Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            log.warn("No user found with email: {}", email);
            response.put("success", false);
            response.put("message", MessageConst.MSG_EMAIL_NOT_FOUND);
            return response;
        }

        User user = userOpt.get();

        // Check if already verified
        if (Boolean.TRUE.equals(user.getIsVerified())) {
            log.warn("Account already verified for email: {}", email);
            response.put("success", false);
            response.put("message", MessageConst.MSG_ACCOUNT_ALREADY_VERIFIED);
            return response;
        }

        // Find latest unverified, unexpired OTP
        Optional<OtpCode> verOpt = otpCodeRepository
                .findTopByUserIdAndOtpTypeAndIsUsedFalseOrderByCreatedAtDesc(user.getUserId(), CommonConst.OTP_TYPE_REGISTER);
        if (verOpt.isEmpty()) {
            log.warn("No verification record found for email: {}", email);
            if (Boolean.TRUE.equals(user.getIsVerified())) {
                response.put("success", false);
                response.put("message", MessageConst.MSG_VERIFICATION_CODE_USED);
            } else {
                response.put("success", false);
                response.put("message", MessageConst.MSG_VERIFICATION_CODE_INVALID);
            }
            return response;
        }
        OtpCode verification = verOpt.get();
        LocalDateTime now = LocalDateTime.now();

        // Check expiration
        if (verification.getExpiryAt().isBefore(now)) {
            log.warn("OTP expired for email: {}", email);
            response.put("success", false);
            response.put("message", MessageConst.MSG_OTP_EXPIRED);
            return response;
        }
        // For OtpCode entity we don't track failed attempts; simply compare hashed code
        if (code != null && code.equals(verification.getOtpCode())) {
            verification.setIsUsed(true);
            otpCodeRepository.save(verification);

            user.setIsVerified(true);
            userRepository.save(user);

            log.info("Verification successful for email: {}", email);
            response.put("success", true);
            response.put("message", MessageConst.MSG_VERIFICATION_SUCCESS);
        } else {
            log.warn("Invalid OTP for email: {}", email);
            response.put("success", false);
            response.put("message", MessageConst.MSG_VERIFICATION_CODE_INVALID);
        }

        return response;
    }

    /**
     * Resends a verification code to the user's email.
     *
     * @param email the user's email
     * @throws IllegalArgumentException if the email is not found
     * @throws IllegalStateException    if the account is already verified
     */
    @Override
    public void resendVerificationCode(String email) {
        log.info("Resending verification code for email: {}", email);

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            log.warn("No user found with email: {}", email);
            throw new IllegalArgumentException(MessageConst.MSG_EMAIL_NOT_FOUND);
        }

        User user = userOpt.get();

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            log.warn("Account already verified for email: {}", email);
            throw new IllegalStateException(MessageConst.MSG_ACCOUNT_ALREADY_VERIFIED);
        }

        LocalDateTime now = LocalDateTime.now();

        // Tìm bản ghi chưa hết hạn, chưa xác thực
        Optional<OtpCode> verOpt = otpCodeRepository
                .findTopByUserIdAndOtpTypeAndIsUsedFalseOrderByCreatedAtDesc(user.getUserId(), CommonConst.OTP_TYPE_REGISTER);
        OtpCode verification;

        if (verOpt.isPresent() && verOpt.get().getExpiryAt().isAfter(now)) {
            verification = verOpt.get();
            // Kiểm tra giới hạn gửi lại OTP (dùng count trong ngày)
            long resendCount = otpCodeRepository.countByUserIdAndOtpTypeAndCreatedAtAfter(
                    user.getUserId(), CommonConst.OTP_TYPE_REGISTER, now.toLocalDate().atStartOfDay());
            if (resendCount >= CommonConst.OTP_RESEND_LIMIT) {
                log.warn("OTP resend limit exceeded for email: {}", email);
                throw new IllegalStateException(MessageConst.MSG_OTP_RESEND_LIMIT_EXCEEDED);
            }
            // Tạo mã mới
            String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
            verification.setOtpCode(otp);
            verification.setExpiryAt(now.plusMinutes(CommonConst.OTP_EXPIRE_MINUTES));
            verification.setCreatedAt(now);
            verification.setIsUsed(false);
            otpCodeRepository.save(verification);
            mailService.sendVerificationEmail(email, otp, CommonConst.OTP_TYPE_REGISTER);
        } else {
            // Đếm số lần gửi lại OTP trong ngày (tính cả bản ghi cũ)
            long resendCount = otpCodeRepository.countByUserIdAndOtpTypeAndCreatedAtAfter(
                    user.getUserId(), CommonConst.OTP_TYPE_REGISTER, now.toLocalDate().atStartOfDay());
            if (resendCount >= CommonConst.OTP_RESEND_LIMIT) {
                log.warn("OTP resend limit exceeded for email: {}", email);
                throw new IllegalStateException(MessageConst.MSG_OTP_RESEND_LIMIT_EXCEEDED);
            }
            // Tạo OTP mới
            String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));

            verification = new OtpCode();
            verification.setOtpId(IdUtil.randomHex(10));
            verification.setUserId(user.getUserId());
            verification.setOtpType(CommonConst.OTP_TYPE_REGISTER);
            verification.setOtpCode(otp);
            verification.setCreatedAt(now);
            verification.setExpiryAt(now.plusMinutes(CommonConst.OTP_EXPIRE_MINUTES));
            verification.setIsUsed(false);
            otpCodeRepository.save(verification);
            mailService.sendVerificationEmail(email, otp, CommonConst.OTP_TYPE_REGISTER);
        }

        log.info("Verification code resent for email: {}", email);
    }
}
