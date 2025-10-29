package com.connectexe.ConnectEXE.project.controller;

import com.connectexe.ConnectEXE.common.ApiResponse;
import com.connectexe.ConnectEXE.entity.Project;
import com.connectexe.ConnectEXE.project.dto.request.CreateProjectRequest;
import com.connectexe.ConnectEXE.project.dto.request.UpdateProjectRequest;
import com.connectexe.ConnectEXE.project.dto.response.ProjectResponse;
import com.connectexe.ConnectEXE.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Slf4j
@RequiredArgsConstructor
public class ProjectController {
    
    private final ProjectService projectService;

    /**
     * Get random projects from subscribed users
     * @param limit Maximum number of projects
     * @return List of random projects
     */
    @GetMapping("/random")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getRandomProjects(
            @RequestParam(defaultValue = "6") int limit) {
        try {
            String userId = getUserIdFromAuth();
            List<ProjectResponse> projects = projectService.getRandomProjectsFromSubscriptions(userId, limit);
            return ResponseEntity.ok(ApiResponse.success("Random projects retrieved", projects));
        } catch (Exception ex) {
            log.error("Error retrieving random projects: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve random projects"));
        }
    }

    /**
     * Get successful projects
     * @param page Page number
     * @param size Page size
     * @return Page of successful projects
     */
    @GetMapping("/successful")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getSuccessfulProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String userId = getUserIdFromAuth();
            Page<ProjectResponse> projects = projectService.getSuccessfulProjects(page, size, userId);
            return ResponseEntity.ok(ApiResponse.success("Successful projects retrieved", projects));
        } catch (Exception ex) {
            log.error("Error retrieving successful projects: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve successful projects"));
        }
    }

    /**
     * Get all public projects
     * @param page Page number
     * @param size Page size
     * @return Page of projects
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String userId = getUserIdFromAuth();
            Page<ProjectResponse> projects = projectService.getAllProjects(page, size, userId);
            return ResponseEntity.ok(ApiResponse.success("Projects retrieved", projects));
        } catch (Exception ex) {
            log.error("Error retrieving projects: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve projects"));
        }
    }

    /**
     * Get projects by category
     * @param category Project category
     * @param page Page number
     * @param size Page size
     * @return Page of projects
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getProjectsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String userId = getUserIdFromAuth();
            Project.ProjectCategory projectCategory = Project.ProjectCategory.valueOf(category.toUpperCase());
            Page<ProjectResponse> projects = projectService.getProjectsByCategory(projectCategory, page, size, userId);
            return ResponseEntity.ok(ApiResponse.success("Projects by category retrieved", projects));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid category"));
        } catch (Exception ex) {
            log.error("Error retrieving projects by category: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve projects"));
        }
    }

    /**
     * Get project detail by ID
     * @param projectId Project ID
     * @return Project details
     */
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectDetail(@PathVariable String projectId) {
        try {
            String userId = getUserIdFromAuth();
            ProjectResponse project = projectService.getProjectDetail(projectId, userId);
            return ResponseEntity.ok(ApiResponse.success("Project detail retrieved", project));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error retrieving project detail: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve project detail"));
        }
    }

    /**
     * Get projects for voting page (sorted by votes)
     * @param page Page number
     * @param size Page size
     * @return Page of projects with vote counts
     */
    @GetMapping("/voting")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getVotingProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String userId = getUserIdFromAuth();
            Page<ProjectResponse> projects = projectService.getVotingProjects(page, size, userId);
            return ResponseEntity.ok(ApiResponse.success("Voting projects retrieved", projects));
        } catch (Exception ex) {
            log.error("Error retrieving voting projects: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve voting projects"));
        }
    }

    /**
     * Create a new project
     * @param request Project creation request
     * @return Created project
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody CreateProjectRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }
            
            String userId = authentication.getName();
            ProjectResponse project = projectService.createProject(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Project created successfully", project));
        } catch (Exception ex) {
            log.error("Error creating project: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create project"));
        }
    }

    /**
     * Update an existing project
     * @param projectId Project ID
     * @param request Project update request
     * @return Updated project
     */
    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable String projectId,
            @Valid @RequestBody UpdateProjectRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }
            
            String userId = authentication.getName();
            ProjectResponse project = projectService.updateProject(projectId, request, userId);
            return ResponseEntity.ok(ApiResponse.success("Project updated successfully", project));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error updating project: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update project"));
        }
    }

    /**
     * Vote for a project
     * @param projectId Project ID
     * @return Success message
     */
    @PostMapping("/{projectId}/vote")
    public ResponseEntity<ApiResponse<Void>> voteProject(@PathVariable String projectId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }
            
            String userId = authentication.getName();
            projectService.voteProject(projectId, userId);
            return ResponseEntity.ok(ApiResponse.success("Voted successfully", null));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error voting project: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to vote"));
        }
    }

    /**
     * Remove vote from a project
     * @param projectId Project ID
     * @return Success message
     */
    @DeleteMapping("/{projectId}/vote")
    public ResponseEntity<ApiResponse<Void>> unvoteProject(@PathVariable String projectId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }
            
            String userId = authentication.getName();
            projectService.unvoteProject(projectId, userId);
            return ResponseEntity.ok(ApiResponse.success("Vote removed successfully", null));
        } catch (Exception ex) {
            log.error("Error removing vote: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to remove vote"));
        }
    }

    /**
     * Helper method to get userId from SecurityContext
     * Returns null if not authenticated
     */
    private String getUserIdFromAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }
}
