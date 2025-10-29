package com.connectexe.ConnectEXE.project.service;

import com.connectexe.ConnectEXE.entity.Project;
import com.connectexe.ConnectEXE.project.dto.request.CreateProjectRequest;
import com.connectexe.ConnectEXE.project.dto.request.UpdateProjectRequest;
import com.connectexe.ConnectEXE.project.dto.response.ProjectResponse;

import org.springframework.data.domain.Page;

import java.util.List;

public interface ProjectService {
    
    /**
     * Get random projects from subscribed users
     * @param userId Current user ID
     * @param limit Maximum number of projects to return
     * @return List of random projects
     */
    List<ProjectResponse> getRandomProjectsFromSubscriptions(String userId, int limit);
    
    /**
     * Get successful projects (status = SUCCESSFUL)
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param userId Current user ID (optional, for checking vote status)
     * @return Page of successful projects
     */
    Page<ProjectResponse> getSuccessfulProjects(int page, int size, String userId);
    
    /**
     * Get all public projects with pagination
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param userId Current user ID (optional, for checking vote status)
     * @return Page of projects
     */
    Page<ProjectResponse> getAllProjects(int page, int size, String userId);
    
    /**
     * Get projects by category
     * @param category Project category
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param userId Current user ID (optional, for checking vote status)
     * @return Page of projects in the specified category
     */
    Page<ProjectResponse> getProjectsByCategory(Project.ProjectCategory category, int page, int size, String userId);
    
    /**
     * Get project detail by ID
     * @param projectId Project ID
     * @param userId Current user ID (optional, for checking vote status)
     * @return Project details
     */
    ProjectResponse getProjectDetail(String projectId, String userId);
    
    /**
     * Get projects sorted by vote count for voting page
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param userId Current user ID (optional, for checking vote status)
     * @return Page of projects with vote counts
     */
    Page<ProjectResponse> getVotingProjects(int page, int size, String userId);
    
    /**
     * Create a new project
     * @param request Project creation request
     * @param userId ID of the user creating the project
     * @return Created project response
     */
    ProjectResponse createProject(CreateProjectRequest request, String userId);
    
    /**
     * Update an existing project
     * @param projectId Project ID
     * @param request Project update request
     * @param userId ID of the user updating the project
     * @return Updated project response
     */
    ProjectResponse updateProject(String projectId, UpdateProjectRequest request, String userId);
    
    /**
     * Vote for a project
     * @param projectId Project ID
     * @param userId ID of the user voting
     */
    void voteProject(String projectId, String userId);
    
    /**
     * Remove vote from a project
     * @param projectId Project ID
     * @param userId ID of the user removing vote
     */
    void unvoteProject(String projectId, String userId);
}
