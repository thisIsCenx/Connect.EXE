package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "forum_replies")
@Data
public class ForumReply {
    @Id
    @Column(name = "reply_id", length = 12)
    private String replyId;

    @Column(name = "topic_id", length = 12)
    private String topicId;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "content")
    private String content;

    // Parent reply for nested comments (null if it's a root reply)
    @Column(name = "parent_reply_id", length = 12)
    private String parentReplyId;
    
    /**
     * Image URLs from Cloudinary stored as TEXT array in PostgreSQL
     * Format: {"url1", "url2", "url3"}
     */
    @Column(name = "image_urls", columnDefinition = "TEXT[]")
    private List<String> imageUrls;

    // Self-referencing relationship for nested replies
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_reply_id", insertable = false, updatable = false)
    private ForumReply parentReply;

    @OneToMany(mappedBy = "parentReply", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ForumReply> children = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
