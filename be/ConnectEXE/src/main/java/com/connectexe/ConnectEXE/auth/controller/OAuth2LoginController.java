package com.connectexe.ConnectEXE.auth.controller;

import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.repository.UserRepository;
import com.connectexe.ConnectEXE.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@RequiredArgsConstructor
@Controller
public class OAuth2LoginController {

    private final UserRepository userRepository;
    private static final int COOKIE_MAX_AGE = 24 * 60 * 60; // 24 giờ

    @GetMapping("/oauth2/success")
    public String loginSuccess(@AuthenticationPrincipal OAuth2User oAuth2User, HttpServletResponse response) {
        
        log.info("=== OAuth2 Login Success Controller ===");
        
        if (oAuth2User == null) {
            log.error("❌ OAuth2User is null. Cannot proceed.");
            return "redirect:http://localhost:3000/login?error=AuthenticationFailed";
        }

        String email = oAuth2User.getAttribute("email");
        log.info("Authenticated user via OAuth2: {}", email);

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalStateException("User not found in DB after OAuth2 processing for email: " + email));

        if (user.getIsActive() == null || !user.getIsActive()) {
            log.warn("⚠️ Login attempt for inactive account: {}", email);
            return "redirect:http://localhost:3000/login?error=AccountInactive";
        }

        log.info("🍪 Setting authentication cookies for user ID: {}", user.getUserId());
        CookieUtil.addCookie(response, "userId", user.getUserId(), COOKIE_MAX_AGE);
        CookieUtil.addCookie(response, "fullName", user.getFullName(), COOKIE_MAX_AGE);
        CookieUtil.addCookie(response, "role", user.getRole(), COOKIE_MAX_AGE);
        CookieUtil.addCookie(response, "status", String.valueOf(user.getIsActive()), COOKIE_MAX_AGE);
        CookieUtil.addCookie(response, "isVerified", String.valueOf(user.getIsVerified()), COOKIE_MAX_AGE);

        String targetUrl = switch (user.getRole()) {
            case "ADMIN" -> "http://localhost:3000/admin";
            case "TEACHER" -> "http://localhost:3000/teacher";
            default -> "http://localhost:3000/home";
        };

        log.info("🎯 Redirecting to: {}", targetUrl);
        return "redirect:" + targetUrl;
    }
}