package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_codes")
@Data
public class OtpCode {
    @Id
    @Column(name = "otp_id", length = 10)
    private String otpId;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "otp_code", length = 10)
    private String otpCode;

    @Column(name = "otp_type", length = 30)
    private String otpType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expiry_at")
    private LocalDateTime expiryAt;

    @Column(name = "is_used")
    private Boolean isUsed;
}
