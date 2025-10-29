package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "forum_topics")
@Data
public class ForumTopic {
    @Id
    @Column(name = "topic_id", length = 12)
    private String topicId;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "content")
    private String content;

    @Column(name = "approved")
    private Boolean approved = false;

    @Column(name = "is_active")
    private Boolean isActive = true;
    
    /**
     * Image URLs from Cloudinary stored as TEXT array in PostgreSQL
     * Format: {"url1", "url2", "url3"}
     */
    @Column(name = "image_urls", columnDefinition = "TEXT[]")
    private List<String> imageUrls;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (approved == null) {
            approved = false;
        }
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
