package com.connectexe.ConnectEXE.auth.controller;

import com.connectexe.ConnectEXE.auth.dto.request.LoginRequest;
import com.connectexe.ConnectEXE.auth.dto.response.LoginResponse;
import com.connectexe.ConnectEXE.auth.service.LoginService;
import com.connectexe.ConnectEXE.common.constant.RouteConst;
import com.connectexe.ConnectEXE.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling login operations.
 * Provides endpoints for user login and logout.
 */
@RestController
@RequestMapping(RouteConst.AUTH_BASE)
@Slf4j
@RequiredArgsConstructor
public class LoginController {
    private final LoginService loginService;
    private static final int COOKIE_MAX_AGE = 24 * 60 * 60;

    /**
     * Authenticate a user and set authentication cookies.
     * @param request the login request containing user credentials
     * @param response the HTTP response to set cookies
     * @return the login response containing user details
     */
    @PostMapping(RouteConst.LOGIN)
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {
        try {
            LoginResponse loginResponse = loginService.login(request.getEmail(), request.getPassword());
            CookieUtil.addCookie(response, "userId", String.valueOf(loginResponse.getUserId()), COOKIE_MAX_AGE);
            CookieUtil.addCookie(response, "fullName", loginResponse.getFullName(), COOKIE_MAX_AGE);
            CookieUtil.addCookie(response, "role", loginResponse.getRole(), COOKIE_MAX_AGE);
            CookieUtil.addCookie(response, "status", String.valueOf(loginResponse.isActive()), COOKIE_MAX_AGE);
            CookieUtil.addCookie(response, "isVerified", String.valueOf(loginResponse.isVerified()), COOKIE_MAX_AGE);
            // return token + profile
            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException ex) {
            // Authentication failure -> 401 Unauthorized
            log.warn("Login failed for {}: {}", request.getEmail(), ex.getMessage());
            return ResponseEntity.status(401).body(null);
        }
    }

    /**
     * Log out a user by clearing authentication cookies.
     * @param response the HTTP response to clear cookies
     * @return an empty response entity
     */
    @PostMapping(RouteConst.LOGOUT)
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        CookieUtil.removeCookie(response, "userId");
        CookieUtil.removeCookie(response, "fullName");
        CookieUtil.removeCookie(response, "role");
        CookieUtil.removeCookie(response, "status");
        return ResponseEntity.ok().build();
    }
}