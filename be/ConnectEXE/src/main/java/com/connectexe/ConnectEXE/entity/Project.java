package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
    @Id
    @Column(name = "project_id", length = 12)
    private String projectId;

    @Column(name = "project_name", length = 100, nullable = false)
    private String projectName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    @Builder.Default
    private ProjectCategory category = ProjectCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PENDING;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "members", columnDefinition = "TEXT")
    private String members;

    @Column(name = "website_link", length = 500)
    private String websiteLink;

    @Column(name = "github_link", length = 500)
    private String githubLink;

    @Column(name = "demo_link", length = 500)
    private String demoLink;

    @Column(name = "owner_id", length = 12, nullable = false)
    private String ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    @OneToMany(mappedBy = "projectId", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Vote> votes = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ProjectCategory {
        TECHNOLOGY,
        EDUCATION,
        RECYCLE,
        INDUSTRIAL,
        OTHER
    }

    public enum ProjectStatus {
        PENDING,
        APPROVED,
        SUCCESSFUL,
        REJECTED
    }
}
