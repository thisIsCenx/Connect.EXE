package com.connectexe.ConnectEXE.auth.controller;

import com.connectexe.ConnectEXE.auth.dto.request.ForgotPasswordRequestDTO;
import com.connectexe.ConnectEXE.auth.dto.request.ResetPasswordRequestDTO;
import com.connectexe.ConnectEXE.auth.dto.request.VerifyOtpRequestDTO;
import com.connectexe.ConnectEXE.auth.service.ForgotPasswordService;
import com.connectexe.ConnectEXE.common.constant.AuthorityConst;
import com.connectexe.ConnectEXE.common.constant.RouteConst;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller for handling password reset operations.
 * Provides endpoints for sending OTP, verifying OTP, and resetting password.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(RouteConst.AUTH_BASE)
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    /**
     * Send an OTP to the user's email for password reset.
     * 
     * @param email the user's email
     * @return a response map indicating success or failure
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.PASSWORD_FORGOT)
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        Map<String, Object> response = forgotPasswordService.sendOtp(request.getEmail());
        return (Boolean) response.get("success")
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    /**
     * Verify the OTP for password reset.
     * 
     * @param email the user's email
     * @param otp   the OTP to verify
     * @return a response map indicating success or failure
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.PASSWORD_VERIFY)
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody VerifyOtpRequestDTO request) {
        Map<String, Object> response = forgotPasswordService.verifyOtp(request.getEmail(), request.getOtp());
        return (Boolean) response.get("success")
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    /**
     * Reset the user's password.
     * 
     * @param email       the user's email
     * @param newPassword the new password
     * @return a response map indicating success or failure
     */
    @PreAuthorize(AuthorityConst.AUTH_ALL)
    @PostMapping(RouteConst.PASSWORD_RESET)
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        Map<String, Object> response = forgotPasswordService.resetPassword(request.getEmail(),
                request.getNewPassword());
        return (Boolean) response.get("success")
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }
}