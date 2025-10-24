package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
public class Project {
    @Id
    @Column(name = "project_id", length = 12)
    private String projectId;

    @Column(name = "project_name", length = 100)
    private String projectName;

    @Column(name = "description")
    private String description;

    @Column(name = "owner_id", length = 12)
    private String ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_public")
    private Boolean isPublic;
}
