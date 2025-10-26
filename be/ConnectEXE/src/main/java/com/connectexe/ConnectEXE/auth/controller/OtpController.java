package com.connectexe.ConnectEXE.auth.controller;

import com.connectexe.ConnectEXE.auth.service.ForgotPasswordService;
import com.connectexe.ConnectEXE.auth.service.RegisterService;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.repository.UserRepository;
import com.connectexe.ConnectEXE.common.constant.RouteConst;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

/**
 * General OTP endpoints: send and verify for different OTP types.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping(RouteConst.OTP_BASE)
public class OtpController {

    private final RegisterService registerService;
    private final ForgotPasswordService forgotPasswordService;
    private final UserRepository userRepository;

    /**
     * Send OTP for verification/reset/twofactor based on otptype.
     * Body: { "otptype": "verification|resetpassword|twofactor", "email": "...", "phone": "..." }
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String otptype = body.get("otptype");
        String email = body.get("email");
        String phone = body.get("phone");

        try {
            if (otptype == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "otptype is required"));
            }

            switch (otptype.toLowerCase()) {
                case "verification":
                    if (email == null) {
                        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "email is required for verification"));
                    }
                    registerService.resendVerificationCode(email);
                    return ResponseEntity.ok(Map.of("success", true));
                case "resetpassword":
                    if (email == null && phone == null) {
                        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "email or phone is required for resetpassword"));
                    }
                    Map<String, Object> resp = forgotPasswordService.sendOtp(email != null ? email : phone);
                    return ResponseEntity.ok(resp);
                case "twofactor":
                    // Not implemented in current services
                    return ResponseEntity.status(501).body(Map.of("success", false, "message", "twofactor not implemented"));
                default:
                    return ResponseEntity.badRequest().body(Map.of("success", false, "message", "unknown otptype"));
            }

        } catch (IllegalArgumentException e) {
            log.warn("Bad request while sending OTP: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalStateException e) {
            log.warn("State error while sending OTP: {}", e.getMessage());
            return ResponseEntity.status(429).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error sending OTP: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to send OTP"));
        }
    }

    /**
     * Verify OTP.
     * Body: { "userid": "...", "email": "...", "otpcode": "...", "otptype": "verification|resetpassword" }
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String otptype = body.get("otptype");
        String otpcode = body.get("otpcode");
        String email = body.get("email");
        String userid = body.get("userid");

        if (otptype == null || otpcode == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "otptype and otpcode are required"));
        }

        // Try to resolve email from userid if needed
        if (email == null && userid != null) {
            Optional<User> uOpt = userRepository.findById(userid);
            if (uOpt.isPresent()) {
                email = uOpt.get().getEmail();
            }
        }

        try {
            switch (otptype.toLowerCase()) {
                case "verification":
                    if (email == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "email or userid required"));
                    Map<String, Object> resp = registerService.verifyCode(email, otpcode);
                    boolean success = Boolean.TRUE.equals((Boolean) resp.get("success"));
                    if (success) return ResponseEntity.ok(resp);
                    String msg = (String) resp.get("message");
                    if (msg != null && msg.toLowerCase().contains("expired")) {
                        return ResponseEntity.status(410).body(resp);
                    }
                    return ResponseEntity.badRequest().body(resp);
                case "resetpassword":
                    if (email == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "email or userid required"));
                    Map<String, Object> resp2 = forgotPasswordService.verifyOtp(email, otpcode);
                    boolean s2 = Boolean.TRUE.equals((Boolean) resp2.get("success"));
                    if (s2) return ResponseEntity.ok(resp2);
                    String m2 = (String) resp2.get("message");
                    if (m2 != null && m2.toLowerCase().contains("expired")) {
                        return ResponseEntity.status(410).body(resp2);
                    }
                    return ResponseEntity.badRequest().body(resp2);
                default:
                    return ResponseEntity.badRequest().body(Map.of("success", false, "message", "unknown otptype"));
            }

        } catch (Exception e) {
            log.error("Error verifying OTP: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
