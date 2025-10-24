package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
public class Comment {
    @Id
    @Column(name = "comment_id", length = 12)
    private String commentId;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "project_id", length = 12)
    private String projectId;

    @Column(name = "content")
    private String content;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
