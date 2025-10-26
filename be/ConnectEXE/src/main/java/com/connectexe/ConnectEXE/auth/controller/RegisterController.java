package com.connectexe.ConnectEXE.auth.controller;

import com.connectexe.ConnectEXE.auth.dto.request.RegisterRequest;
import com.connectexe.ConnectEXE.auth.dto.request.VerifyCodeRequest;
import com.connectexe.ConnectEXE.auth.dto.response.RegisterResponse;
import com.connectexe.ConnectEXE.auth.service.RegisterService;
import com.connectexe.ConnectEXE.common.constant.MessageConst;
import com.connectexe.ConnectEXE.common.constant.RouteConst;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling registration operations.
 * Provides endpoints for user registration, verification, and resending
 * verification code.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(RouteConst.AUTH_BASE)
public class RegisterController {

    private final RegisterService registerService;

    /**
     * Register a new user and send a verification email.
     * 
     * @param request the registration request containing user details
     * @return the registration response with a success or error message
     */
    @PostMapping(RouteConst.REGISTER)
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = registerService.register(request);

        // If any duplicate info, return 409 Conflict with details
        if (response.isEmailUsed() || response.isPhoneUsed() || response.isIdentityCardUsed()) {
            return ResponseEntity.status(409).body(response);
        }

        // Triggers OTP send via the same logic used by /auth/otp/send (otptype=verification)
        // We don't fail the registration if sending email has issues.
        try {
            registerService.resendVerificationCode(request.getEmail());
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Post-register OTP send skipped: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("Post-register OTP send failed: {}", e.getMessage());
        }

        // On success return 201 Created with userId + token
        return ResponseEntity.status(201).body(response);
    }

    /**
     * Verify a user's email with a verification code.
     * 
     * @param request the verification request containing email and code
     * @return the verification response
     */
    @PostMapping(RouteConst.REGISTER_VERIFY)
    public ResponseEntity<?> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        try {
            Map<String, Object> response = registerService.verifyCode(request.getEmail(),
                    request.getVerificationCode());
            boolean success = (Boolean) response.get("success");

            if (success) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("Error during verification: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Resend a verification code to the user's email.
     * 
     * @param request the request containing the user's email
     * @return the resend response
     */
    @PostMapping(RouteConst.REGISTER_RESEND)
    public ResponseEntity<?> resendCode(@Valid @RequestBody VerifyCodeRequest request) {
        try {
            registerService.resendVerificationCode(request.getEmail());
            return ResponseEntity.ok(RegisterResponse.builder()
                    .message(MessageConst.MSG_VERIFICATION_CODE_RESENT)
                    .emailUsed(false)
                    .phoneUsed(false)
                    .identityCardUsed(false)
                    .build());
        } catch (IllegalArgumentException e) {
            log.warn("Email not found for resend: {}", request.getEmail());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (IllegalStateException e) {
            log.warn("Account already verified or resend limit exceeded: {}", request.getEmail());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error during resend: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to resend verification code. Please try again later.");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}