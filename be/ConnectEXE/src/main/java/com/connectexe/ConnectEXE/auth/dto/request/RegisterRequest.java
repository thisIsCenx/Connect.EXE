package com.connectexe.ConnectEXE.auth.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for user registration requests.
 * Contains user information required for registration.
 */
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    /** The user's password. Required. */
    @NotBlank(message = "password is required")
    @Size(min = 6, message = "password must be at least 6 characters")
    private String password;

    /** The user's full name. Required. */
    @NotBlank(message = "fullName is required")
    private String fullName;

    /** The user's date of birth. Optional. */
    private LocalDate dateOfBirth;

    /** The user's gender. Optional. */
    private String gender;

    /** The user's identity card number. Optional. */
    private String identityCard;

    /** The user's email address. Required. */
    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid email address")
    private String email;

    /** The user's address. Optional. */
    private String address;

    /** The user's phone number. Optional. */
    private String phoneNumber;
}