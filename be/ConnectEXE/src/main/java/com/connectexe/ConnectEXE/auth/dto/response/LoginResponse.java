package com.connectexe.ConnectEXE.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for login responses.
 * Contains user information after successful login.
 */
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    /** The user's unique ID. */
    private String userId;
    /** The user's full name. */
    private String fullName;
    /** The user's role. */
    private String role;
    /** The user's account status (active/inactive). */
    private boolean isActive;
}