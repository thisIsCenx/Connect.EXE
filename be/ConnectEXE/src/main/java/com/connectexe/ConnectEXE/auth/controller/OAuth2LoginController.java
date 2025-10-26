package com.connectexe.ConnectEXE.auth.controller;

import com.connectexe.ConnectEXE.auth.service.CustomOAuth2UserService;
import com.connectexe.ConnectEXE.common.constant.RouteConst;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller for handling OAuth2 login operations.
 * Provides endpoint for successful OAuth2 login and cookie setup.
 */
@Slf4j
@RequiredArgsConstructor
@Controller
public class OAuth2LoginController {

    private final CustomOAuth2UserService customOAuth2UserService;
    private static final int COOKIE_MAX_AGE = 24 * 60 * 60;

    /**
     * Handle successful OAuth2 login and set authentication cookies.
     * @param oAuth2User the authenticated OAuth2 user
     * @param response the HTTP response to set cookies
     * @return a redirect URL based on the user's role
     */
    @GetMapping(RouteConst.OAUTH2_SUCCESS)
    public String loginSuccess(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            HttpServletResponse response) {
        try {
            User user = customOAuth2UserService.processOAuth2User(oAuth2User);

            if (user.getIsActive() == null || !user.getIsActive()) {
                return "redirect:http://localhost:3000/login?error=AccountInactive";
            }

            // OAuth2 users đã được provider verify email, không cần kiểm tra emailVerified

            CookieUtil.addCookie(response, "userId", String.valueOf(user.getUserId()), COOKIE_MAX_AGE);
            CookieUtil.addCookie(response, "fullName", user.getFullName(), COOKIE_MAX_AGE);
            CookieUtil.addCookie(response, "role", user.getRole(), COOKIE_MAX_AGE);
            CookieUtil.addCookie(response, "status", String.valueOf(user.getIsActive()), COOKIE_MAX_AGE);

            String target = switch (user.getRole()) {
                case "ADMIN" -> "http://localhost:3000/admin";
                case "TEACHER" -> "http://localhost:3000/teacher";
                default -> "http://localhost:3000/home";
            };

            return "redirect:" + target;
        } catch (Exception e) {
            return "redirect:http://localhost:3000/login?error=GoogleLoginFailed";
        }
    }
}