package com.connectexe.ConnectEXE.auth.service.impl;

import com.connectexe.ConnectEXE.auth.dto.response.LoginResponse;
import com.connectexe.ConnectEXE.auth.service.LoginService;
import com.connectexe.ConnectEXE.common.exception.AuthException;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import com.connectexe.ConnectEXE.common.constant.MessageConst;

/**
 * Implementation for handling login operations.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;

    /**
     * Authenticates the user login.
     *
     * @param email the user's email
     * @param rawPassword the password
     * @return the login information
     */
    @Override
    public LoginResponse login(String email, String rawPassword) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            log.warn("Account not found for email: {}", email);
            throw new AuthException("Email hoặc số điện thoại không tồn tại trong hệ thống.");
        }
        User user = optionalUser.get();
        validatePassword(user, rawPassword, email);
        validateStatus(user, email);
            boolean verified = Boolean.TRUE.equals(user.getIsVerified());
    return LoginResponse.builder()
        .userId(user.getUserId())
        .fullName(user.getFullName())
        .role(user.getRole())
        .isActive(Boolean.TRUE.equals(user.getIsActive()))
                .isVerified(verified)
        .build();
    }

    /**
     * Validates the user's password.
     *
     * @param user the user
     * @param rawPassword the input password
     * @param emailOrPhone the email or phone number
     */
    private void validatePassword(User user, String rawPassword, String email) {
        if (!encoder.matches(rawPassword, user.getPassword())) {
            log.warn("Incorrect password for user: {}", email);
            throw new AuthException("Mật khẩu không đúng.");
        }
    }

    /**
     * Validates the user's account status.
     *
     * @param user the user
     * @param emailOrPhone the email or phone number
     */
    private void validateStatus(User user, String email) {
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            log.warn("Inactive account for user: {}", email);
            throw new AuthException(MessageConst.MSG_ACCOUNT_INACTIVE);
        }
    }

    /**
     * Validates the user's email verification status.
     *
     * @param user the user
     * @param emailOrPhone the email or phone number
     */
    private void validateEmailVerified(User user, String email) {
        // Kiểm tra email verification cho tất cả user, không phân biệt provider
        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            log.warn("Email not verified for user: {}", email);
            throw new AuthException(MessageConst.MSG_EMAIL_NOT_VERIFIED);
        }
    }
}