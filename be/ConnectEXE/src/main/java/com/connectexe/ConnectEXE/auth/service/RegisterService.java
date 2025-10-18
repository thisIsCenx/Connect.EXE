package com.connectexe.ConnectEXE.auth.service;

import com.connectexe.ConnectEXE.auth.dto.request.RegisterRequest;
import com.connectexe.ConnectEXE.auth.dto.response.RegisterResponse;

import java.util.Map;

/**
 * Interface for handling registration operations.
 * Provides methods for user registration, verification, and resending verification code.
 */
public interface RegisterService {

    /**
     * Register a new user and send a verification email.
     * @param request the registration request containing user details
     * @return the registration response with a success or error message
     * @throws IllegalArgumentException if the email or phone number is already used
     */
    RegisterResponse register(RegisterRequest request);

    /**
     * Verify a user's email with a verification code.
     * @param email the user's email
     * @param code the verification code
     * @return a response map indicating success or failure with detailed message
     */
    Map<String, Object> verifyCode(String email, String code);

    /**
     * Resend a verification code to the user's email.
     * @param email the user's email
     * @throws IllegalArgumentException if the email is not found
     * @throws IllegalStateException if the account is already verified
     */
    void resendVerificationCode(String email);
}