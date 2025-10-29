package com.connectexe.ConnectEXE.project.dto.response;

import com.connectexe.ConnectEXE.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private String projectId;
    private String projectName;
    private String description;
    private String content;
    private Project.ProjectCategory category;
    private Project.ProjectStatus status;
    private String imageUrl;
    private String tags;
    private String members;
    private String websiteLink;
    private String githubLink;
    private String demoLink;
    private String ownerId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isPublic;
    private Long voteCount;
    private Boolean hasVoted;
}
