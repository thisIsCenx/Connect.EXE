package com.connectexe.ConnectEXE.auth.service.impl;

import com.connectexe.ConnectEXE.auth.service.ForgotPasswordService;
import com.connectexe.ConnectEXE.auth.service.MailService;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.repository.UserRepository;
import com.connectexe.ConnectEXE.entity.OtpCode;
import com.connectexe.ConnectEXE.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.connectexe.ConnectEXE.common.constant.MessageConst;

import java.time.LocalDateTime;
import static com.connectexe.ConnectEXE.common.constant.CommonConst.*;

/**
 * Implementation for handling forgot password operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final MailService mailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public Map<String, Object> sendOtp(String email) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_EMAIL_NOT_FOUND);
            return response;
        }
        User user = userOpt.get();
        LocalDateTime now = LocalDateTime.now();
        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        String codeHash = BCrypt.hashpw(otp, BCrypt.gensalt());
        LocalDateTime expiredAt = now.plusMinutes(OTP_EXPIRE_MINUTES);
        Optional<OtpCode> verOpt = otpCodeRepository
                .findTopByUserIdAndOtpTypeAndIsUsedFalseOrderByCreatedAtDesc(user.getUserId(), OTP_TYPE_FORGOT);
        OtpCode verification;
        if (verOpt.isPresent() && verOpt.get().getExpiryAt().isAfter(now)) {
            verification = verOpt.get();
            long resendCount = otpCodeRepository.countByUserIdAndOtpTypeAndCreatedAtAfter(
                    user.getUserId(), OTP_TYPE_FORGOT, now.toLocalDate().atStartOfDay());
            if (resendCount >= OTP_RESEND_LIMIT) {
                response.put("success", false);
                response.put("message", MessageConst.MSG_OTP_RESEND_LIMIT_EXCEEDED);
                return response;
            }
            verification.setOtpCode(codeHash);
            verification.setExpiryAt(expiredAt);
            verification.setCreatedAt(now);
            verification.setIsUsed(false);
            otpCodeRepository.save(verification);
            mailService.sendVerificationEmail(email, otp, OTP_TYPE_FORGOT);
        } else {
            long resendCount = otpCodeRepository.countByUserIdAndOtpTypeAndCreatedAtAfter(
                    user.getUserId(), OTP_TYPE_FORGOT, now.toLocalDate().atStartOfDay());
            if (resendCount >= OTP_RESEND_LIMIT) {
                response.put("success", false);
                response.put("message", MessageConst.MSG_OTP_RESEND_LIMIT_EXCEEDED);
                return response;
            }
            verification = new OtpCode();
            verification.setOtpId(java.util.UUID.randomUUID().toString());
            verification.setUserId(user.getUserId());
            verification.setOtpType(OTP_TYPE_FORGOT);
            verification.setOtpCode(codeHash);
            verification.setCreatedAt(now);
            verification.setExpiryAt(expiredAt);
            verification.setIsUsed(false);
            otpCodeRepository.save(verification);
            mailService.sendVerificationEmail(email, otp, OTP_TYPE_FORGOT);
        }
        response.put("success", true);
        response.put("message", MessageConst.MSG_OTP_SENT);
        return response;
    }

    @Override
    public Map<String, Object> verifyOtp(String email, String otp) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_EMAIL_NOT_FOUND);
            return response;
        }
        User user = userOpt.get();
        Optional<OtpCode> verOpt = otpCodeRepository
                .findTopByUserIdAndOtpTypeAndIsUsedFalseOrderByCreatedAtDesc(user.getUserId(), OTP_TYPE_FORGOT);
        if (verOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_OTP_INVALID);
            return response;
        }
        OtpCode verification = verOpt.get();
        LocalDateTime now = LocalDateTime.now();
        if (verification.getExpiryAt().isBefore(now)) {
            response.put("success", false);
            response.put("message", MessageConst.MSG_OTP_EXPIRED);
            return response;
        }
        if (BCrypt.checkpw(otp, verification.getOtpCode())) {
            verification.setIsUsed(true);
            otpCodeRepository.save(verification);
            response.put("success", true);
            response.put("message", MessageConst.MSG_OTP_VALID);
        } else {
            response.put("success", false);
            response.put("message", MessageConst.MSG_OTP_INVALID);
        }
        return response;
    }

    @Override
    public Map<String, Object> resetPassword(String email, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        log.info("Reset password request for email: {}", email);
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            log.warn("User not found for email: {}", email);
            response.put("success", false);
            response.put("message", MessageConst.MSG_EMAIL_NOT_FOUND);
            return response;
        }
        User user = userOpt.get();
        log.info("User found: {}", user.getEmail());
        Optional<OtpCode> verOpt = otpCodeRepository
                .findTopByUserIdAndOtpTypeAndIsUsedTrueOrderByCreatedAtDesc(user.getUserId(), OTP_TYPE_FORGOT);
        if (verOpt.isEmpty() || verOpt.get().getExpiryAt().isBefore(LocalDateTime.now())) {
            log.warn("No verified OTP found or OTP expired for user: {}", email);
            response.put("success", false);
            response.put("message", MessageConst.MSG_OTP_NOT_VERIFIED_OR_EXPIRED);
            return response;
        }
        log.info("Verified OTP found for user: {}", email);
        if (encoder.matches(newPassword, user.getPassword())) {
            log.warn("New password same as old password for user: {}", email);
            response.put("success", false);
            response.put("message", MessageConst.MSG_NEW_PASSWORD_SAME_AS_OLD);
            return response;
        }
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password reset successful for user: {}", email);
        response.put("success", true);
        response.put("message", MessageConst.MSG_PASSWORD_RESET_SUCCESS);
        return response;
    }
}
