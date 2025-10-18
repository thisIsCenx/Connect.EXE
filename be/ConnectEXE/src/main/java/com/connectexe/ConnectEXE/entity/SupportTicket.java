package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
@Data
public class SupportTicket {
    @Id
    @Column(name = "ticket_id", length = 12)
    private String ticketId;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "subject", length = 100)
    private String subject;

    @Column(name = "description")
    private String description;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
