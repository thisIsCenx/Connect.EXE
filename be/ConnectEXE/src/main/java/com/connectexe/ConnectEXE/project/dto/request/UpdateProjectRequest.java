package com.connectexe.ConnectEXE.project.dto.request;

import com.connectexe.ConnectEXE.entity.Project;
import lombok.Data;

@Data
public class UpdateProjectRequest {
    
    private String projectName;
    
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
