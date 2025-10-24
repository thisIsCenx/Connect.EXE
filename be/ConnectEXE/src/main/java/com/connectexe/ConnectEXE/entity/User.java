package com.connectexe.ConnectEXE.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "password", length = 128, nullable = false)
    private String password;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "identity_number", length = 30)
    private String identityNumber;

    @Column(name = "major", length = 50)
    private String major;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_verified")
    private Boolean isVerified;

    @Column(name = "role", length = 20)
    private String role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and Setters
}
