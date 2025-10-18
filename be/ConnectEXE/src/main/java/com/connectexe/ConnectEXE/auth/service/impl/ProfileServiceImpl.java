package com.connectexe.ConnectEXE.auth.service.impl;

import com.connectexe.ConnectEXE.auth.dto.request.EditProfileRequestDTO;
import com.connectexe.ConnectEXE.auth.dto.response.EditProfileResponseDTO;
import com.connectexe.ConnectEXE.auth.service.ProfileService;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import com.connectexe.ConnectEXE.common.constant.MessageConst;

/**
 * Implementation for handling profile operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * Changes the user's password.
     *
     * @param userId      the user ID
     * @param oldPassword the old password
     * @param newPassword the new password
     */
    @Override
    public void changePassword(String userId, String oldPassword, String newPassword) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException(MessageConst.MSG_USER_NOT_FOUND));

            if (user.getPassword() == null || user.getPassword().isBlank()) {
                log.warn("Attempt to change password for Google login account, userId: {}", userId);
                throw new RuntimeException(MessageConst.MSG_CANNOT_CHANGE_GOOGLE_PASSWORD);
            }

            if (!encoder.matches(oldPassword, user.getPassword())) {
                log.warn("Incorrect old password for userId: {}", userId);
                throw new RuntimeException(MessageConst.MSG_CURRENT_PASSWORD_INCORRECT);
            }

            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);
            log.info("Password changed successfully for userId: {}", userId);
        } catch (Exception e) {
            log.error("Error changing password for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }

    /**
     * Updates the user's profile information.
     *
     * @param userId the user ID
     * @param dto    the profile update data
     */
    @Override
    public void editProfile(String userId, EditProfileRequestDTO dto) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException(MessageConst.MSG_USER_NOT_FOUND));

            // Kiểm tra email duy nhất
            if (!user.getEmail().equals(dto.getEmail())) {
                if (userRepository.existsByEmail(dto.getEmail()) &&
                        !userRepository.findByEmail(dto.getEmail()).get().getUserId().equals(userId)) {
                    log.warn("Email already exists for userId: {}, email: {}", userId, dto.getEmail());
                    throw new RuntimeException(MessageConst.MSG_EMAIL_ALREADY_EXISTS);
                }
                if (!Boolean.TRUE.equals(user.getIsVerified()) && dto.getEmail() != null && !dto.getEmail().isEmpty()) {
                    user.setEmail(dto.getEmail());
                }
            }

            // Kiểm tra phone duy nhất và xử lý rỗng
            if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isEmpty()) {
                if (!Objects.equals(user.getPhone(), dto.getPhoneNumber())) {
                    if (userRepository.existsByPhoneNumber(dto.getPhoneNumber()) &&
                            !userRepository.findByPhoneNumber(dto.getPhoneNumber()).get().getUserId().equals(userId)) {
                        log.warn("Phone number already exists for userId: {}, phone: {}", userId,
                                dto.getPhoneNumber());
                        throw new RuntimeException(MessageConst.MSG_PHONE_ALREADY_EXISTS);
                    }
                }
                user.setPhone(dto.getPhoneNumber());
            }

            // Kiểm tra identityCard duy nhất
            if (dto.getIdentityCard() != null && !dto.getIdentityCard().isEmpty()) {
                if (!Objects.equals(user.getIdentityNumber(), dto.getIdentityCard())) {
                    if (userRepository.existsByIdentityCard(dto.getIdentityCard()) &&
                            !userRepository.findByIdentityCard(dto.getIdentityCard()).get().getUserId().equals(userId)) {
                        log.warn("Identity card already exists for userId: {}, identityCard: {}", userId,
                                dto.getIdentityCard());
                        throw new RuntimeException(MessageConst.MSG_IDENTITY_CARD_ALREADY_EXISTS);
                    }
                }
                user.setIdentityNumber(dto.getIdentityCard());
            } else {
                user.setIdentityNumber(dto.getIdentityCard());
            }

            user.setFullName(dto.getFullName());
            // Only set fields that exist on User entity

            userRepository.save(user);
            log.info("Profile updated successfully for userId: {}", userId);
        } catch (Exception e) {
            log.error("Error updating profile for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }

    /**
     * Retrieves the user's profile information.
     *
     * @param userId the user ID
     * @return the profile information
     */
    @Override
    public EditProfileResponseDTO getProfile(String userId) {
        try {
        User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            log.info("Profile fetched successfully for userId: {}", userId);
            return EditProfileResponseDTO.builder()
                    .fullName(user.getFullName())
                    .email(user.getEmail())
            .phoneNumber(user.getPhone())
            .address(null)
            .gender(null)
            .dateOfBirth(null)
            .identityCard(user.getIdentityNumber())
                    .build();
        } catch (Exception e) {
            log.error("Error fetching profile for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @Override
    public Map<String, Boolean> checkEmailAvailability(String userId, String email) {
    try {
        boolean available = !userRepository.findByEmail(email)
            .filter(u -> !u.getUserId().equals(userId))
            .isPresent();
            Map<String, Boolean> response = new HashMap<>();
            response.put("available", available);
            log.info("Checked email availability for userId: {}, email: {}, available: {}", userId, email,
                    available);
            return response;
        } catch (Exception e) {
            log.error("Error checking email availability for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @Override
    public Map<String, Boolean> checkPhoneAvailability(String userId, String phone) {
    try {
        boolean available = !userRepository.findByPhoneNumber(phone)
            .filter(u -> !u.getUserId().equals(userId))
            .isPresent();
            Map<String, Boolean> response = new HashMap<>();
            response.put("available", available);
            log.info("Checked phone availability for userId: {}, phone: {}, available: {}", userId, phone,
                    available);
            return response;
        } catch (Exception e) {
            log.error("Error checking phone availability for userId: {}, error: {}", userId, e.getMessage());
            throw e;
        }
    }
}