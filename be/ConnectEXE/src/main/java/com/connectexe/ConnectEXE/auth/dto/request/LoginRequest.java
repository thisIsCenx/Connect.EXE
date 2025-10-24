package com.connectexe.ConnectEXE.auth.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for login requests.
 * Contains user credentials for login.
 */
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    /** The user's email address. */
    private String email;
    /** The user's password. */
    private String password;
}