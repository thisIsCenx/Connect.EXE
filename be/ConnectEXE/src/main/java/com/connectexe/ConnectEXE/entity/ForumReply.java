package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

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

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
