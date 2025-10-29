package com.connectexe.ConnectEXE.project.dto.request;

import com.connectexe.ConnectEXE.entity.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProjectRequest {
    
    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name must not exceed 100 characters")
    private String projectName;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String content;
    
    private Project.ProjectCategory category;
    
    private String imageUrl;
    
    private String tags;
    
    private String members;
    
    private String websiteLink;
    
    private String githubLink;
    
    private String demoLink;
    
    private Boolean isPublic;
}
