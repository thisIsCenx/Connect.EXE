package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {
    @Id
    @Column(name = "activity_id", length = 12)
    private String activityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50, nullable = false)
    private ActivityType type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public enum ActivityType {
        USER_REGISTERED,
        PROJECT_CREATED,
        PROJECT_APPROVED,
        TOPIC_CREATED,
        USER_STATUS_CHANGED,
        PROJECT_STATUS_CHANGED
    }
}
