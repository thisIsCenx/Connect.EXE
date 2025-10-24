package com.connectexe.ConnectEXE.auth.service;

import com.connectexe.ConnectEXE.auth.dto.response.LoginResponse;

/**
 * Interface for handling login operations.
 * Provides method for user authentication.
 */
public interface LoginService {

    /**
     * Authenticate a user based on email and password.
     * @param email the email of the user
     * @param rawPassword the raw password provided by the user
     * @return the login response containing user details
     * @throws RuntimeException if authentication fails due to invalid credentials or inactive account
     */
    LoginResponse login(String email, String rawPassword);

}