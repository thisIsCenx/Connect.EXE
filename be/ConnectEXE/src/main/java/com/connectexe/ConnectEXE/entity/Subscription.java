package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
public class Subscription {
    @Id
    @Column(name = "subscription_id", length = 12)
    private String subscriptionId;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "subscription_type", length = 20)
    private String subscriptionType;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "active")
    private Boolean active;
}
