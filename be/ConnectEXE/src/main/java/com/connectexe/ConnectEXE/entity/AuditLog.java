package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @Column(name = "log_id", length = 12)
    private String logId;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "action", length = 100)
    private String action;

    @Column(name = "details")
    private String details;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}
