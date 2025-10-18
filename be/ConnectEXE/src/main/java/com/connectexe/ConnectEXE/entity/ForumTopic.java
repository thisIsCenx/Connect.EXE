package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

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

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
