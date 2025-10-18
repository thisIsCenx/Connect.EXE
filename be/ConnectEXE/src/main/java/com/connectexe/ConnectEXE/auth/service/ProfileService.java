package com.connectexe.ConnectEXE.auth.service;

import com.connectexe.ConnectEXE.auth.dto.request.EditProfileRequestDTO;
import com.connectexe.ConnectEXE.auth.dto.response.EditProfileResponseDTO;

import java.util.Map;

/**
 * Interface for handling user profile operations.
 * Provides methods for changing password, editing profile, and checking user info.
 */
public interface ProfileService {
    /**
     * Change the user's password.
     * @param userId the user ID
     * @param oldPassword the old password
     * @param newPassword the new password
     */
    void changePassword(String userId, String oldPassword, String newPassword);
    /**
     * Edit the user's profile information.
     * @param userId the user ID
     * @param dto the profile update data
     */
    void editProfile(String userId, EditProfileRequestDTO dto);
    /**
     * Retrieve the user's profile information.
     * @param userId the user ID
     * @return the profile information
     */
    EditProfileResponseDTO getProfile(String userId);
    /**
     * Check if the given email is available for the user.
     * @param userId the user ID
     * @param email the email to check
     * @return a map indicating availability
     */
    Map<String, Boolean> checkEmailAvailability(String userId, String email);
    /**
     * Check if the given phone number is available for the user.
     * @param userId the user ID
     * @param phone the phone number to check
     * @return a map indicating availability
     */
    Map<String, Boolean> checkPhoneAvailability(String userId, String phone);
}