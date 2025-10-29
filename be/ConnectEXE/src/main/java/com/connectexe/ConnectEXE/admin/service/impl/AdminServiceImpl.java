package com.connectexe.ConnectEXE.admin.service.impl;

import com.connectexe.ConnectEXE.admin.dto.request.ApproveProjectRequestDTO;
import com.connectexe.ConnectEXE.admin.dto.request.UpdateUserStatusRequestDTO;
import com.connectexe.ConnectEXE.admin.dto.response.*;
import com.connectexe.ConnectEXE.admin.service.AdminService;
import com.connectexe.ConnectEXE.entity.ActivityLog;
import com.connectexe.ConnectEXE.entity.Project;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ForumTopicRepository forumTopicRepository;
    private final ForumReplyRepository forumReplyRepository;
    private final ActivityLogRepository activityLogRepository;
    
    @Override
    public DashboardStatsResponseDTO getDashboardStats() {
        // Get total counts
        long totalUsers = userRepository.count();
        long totalProjects = projectRepository.count();
        long totalTopics = forumTopicRepository.count();
        long totalReplies = forumReplyRepository.count();
        
        // Get pending projects
        long pendingProjects = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() == Project.ProjectStatus.PENDING)
                .count();
        
        // Get active users (users who are active)
        long activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getIsActive() != null && u.getIsActive())
                .count();
        
        // Get projects created this month
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        long projectsThisMonth = projectRepository.findAll().stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(startOfMonth))
                .count();
        
        // Get topics created this month
        long topicsThisMonth = forumTopicRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(startOfMonth))
                .count();
        
        return DashboardStatsResponseDTO.builder()
                .totalUsers(totalUsers)
                .totalProjects(totalProjects)
                .totalTopics(totalTopics)
                .totalReplies(totalReplies)
                .pendingProjects(pendingProjects)
                .activeUsers(activeUsers)
                .projectsThisMonth(projectsThisMonth)
                .topicsThisMonth(topicsThisMonth)
                .build();
    }
    
    @Override
    public UserListResponseDTO getUsers(Pageable pageable, String role, String status, String searchQuery) {
        Page<User> userPage;
        
        // Apply filters (simplified - you can enhance this with custom queries)
        if (searchQuery != null && !searchQuery.isEmpty()) {
            // Search by name or email
            userPage = userRepository.findAll(pageable);
            // Filter in memory for simplicity (better to use custom query)
            List<User> filteredUsers = userPage.getContent().stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(searchQuery.toLowerCase())) ||
                                 (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchQuery.toLowerCase())))
                    .collect(Collectors.toList());
            userPage = new org.springframework.data.domain.PageImpl<>(filteredUsers, pageable, filteredUsers.size());
        } else {
            userPage = userRepository.findAll(pageable);
        }
        
        List<AdminUserDTO> users = userPage.getContent().stream()
                .map(this::convertToAdminUserDTO)
                .collect(Collectors.toList());
        
        return UserListResponseDTO.builder()
                .users(users)
                .totalPages(userPage.getTotalPages())
                .currentPage(userPage.getNumber())
                .totalItems(userPage.getTotalElements())
                .build();
    }
    
    @Override
    @Transactional
    public String updateUserStatus(UpdateUserStatusRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update status and isActive based on request
        String newStatus = request.getStatus().toUpperCase();
        switch (newStatus) {
            case "ACTIVE":
                user.setIsActive(true);
                user.setStatus("ACTIVE");
                break;
            case "INACTIVE":
                user.setIsActive(false);
                user.setStatus("INACTIVE");
                break;
            case "SUSPENDED":
                user.setIsActive(false);
                user.setStatus("SUSPENDED");
                break;
            default:
                throw new RuntimeException("Invalid status: " + newStatus);
        }
        
        userRepository.save(user);
        
        // Log activity
        logActivity(ActivityLog.ActivityType.USER_STATUS_CHANGED,
                "User " + user.getFullName() + " status changed to " + newStatus,
                user.getUserId(), user.getFullName());
        
        return "User status updated successfully";
    }
    
    @Override
    public ProjectListResponseDTO getProjects(Pageable pageable, String status, String searchQuery) {
        Page<Project> projectPage;
        
        // Apply filters
        if (searchQuery != null && !searchQuery.isEmpty()) {
            projectPage = projectRepository.findAll(pageable);
            List<Project> filteredProjects = projectPage.getContent().stream()
                    .filter(p -> p.getProjectName() != null && 
                                 p.getProjectName().toLowerCase().contains(searchQuery.toLowerCase()))
                    .collect(Collectors.toList());
            projectPage = new org.springframework.data.domain.PageImpl<>(filteredProjects, pageable, filteredProjects.size());
        } else if (status != null && !status.isEmpty()) {
            // Filter by status
            try {
                Project.ProjectStatus projectStatus = Project.ProjectStatus.valueOf(status.toUpperCase());
                projectPage = projectRepository.findAll(pageable);
                List<Project> filteredProjects = projectPage.getContent().stream()
                        .filter(p -> p.getStatus() == projectStatus)
                        .collect(Collectors.toList());
                projectPage = new org.springframework.data.domain.PageImpl<>(filteredProjects, pageable, filteredProjects.size());
            } catch (IllegalArgumentException e) {
                projectPage = projectRepository.findAll(pageable);
            }
        } else {
            projectPage = projectRepository.findAll(pageable);
        }
        
        List<AdminProjectDTO> projects = projectPage.getContent().stream()
                .map(this::convertToAdminProjectDTO)
                .collect(Collectors.toList());
        
        return ProjectListResponseDTO.builder()
                .projects(projects)
                .totalPages(projectPage.getTotalPages())
                .currentPage(projectPage.getNumber())
                .totalItems(projectPage.getTotalElements())
                .build();
    }
    
    @Override
    @Transactional
    public String approveProject(ApproveProjectRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (request.getApproved()) {
            project.setStatus(Project.ProjectStatus.APPROVED);
            
            // Log activity
            logActivity(ActivityLog.ActivityType.PROJECT_APPROVED,
                    "Project '" + project.getProjectName() + "' has been approved",
                    project.getOwnerId(), getOwnerName(project.getOwnerId()));
        } else {
            project.setStatus(Project.ProjectStatus.REJECTED);
        }
        
        projectRepository.save(project);
        
        return "Project " + (request.getApproved() ? "approved" : "rejected") + " successfully";
    }
    
    @Override
    public RecentActivitiesResponseDTO getRecentActivities(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<ActivityLog> activities = activityLogRepository.findRecentActivities(pageable);
        
        List<ActivityLogDTO> activityDTOs = activities.stream()
                .map(this::convertToActivityLogDTO)
                .collect(Collectors.toList());
        
        return RecentActivitiesResponseDTO.builder()
                .activities(activityDTOs)
                .totalItems((long) activityDTOs.size())
                .build();
    }
    
    @Override
    @Transactional
    public String deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Soft delete: Set isActive to false instead of hard delete
        user.setIsActive(false);
        userRepository.save(user);
        
        // Log activity
        logActivity(ActivityLog.ActivityType.USER_STATUS_CHANGED,
                "User " + user.getFullName() + " has been deactivated (soft deleted)",
                user.getUserId(), user.getFullName());
        
        return "User deactivated successfully";
    }
    
    @Override
    @Transactional
    public String deleteProject(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        projectRepository.delete(project);
        
        return "Project deleted successfully";
    }
    
    // Helper methods
    
    private AdminUserDTO convertToAdminUserDTO(User user) {
        // Determine status: use status column if exists, fallback to isActive
        String userStatus;
        if (user.getStatus() != null && !user.getStatus().isEmpty()) {
            userStatus = user.getStatus();
        } else {
            userStatus = user.getIsActive() != null && user.getIsActive() ? "ACTIVE" : "INACTIVE";
        }
        
        return AdminUserDTO.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(userStatus)
                .createdAt(user.getCreatedAt())
                .lastLogin(null) // TODO: Add lastLogin field to User entity
                .build();
    }
    
    private AdminProjectDTO convertToAdminProjectDTO(Project project) {
        return AdminProjectDTO.builder()
                .projectId(project.getProjectId())
                .title(project.getProjectName())
                .description(project.getDescription())
                .owner(getOwnerName(project.getOwnerId()))
                .status(project.getStatus().name())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
    
    private ActivityLogDTO convertToActivityLogDTO(ActivityLog log) {
        return ActivityLogDTO.builder()
                .activityId(log.getActivityId())
                .type(log.getType().name())
                .description(log.getDescription())
                .userId(log.getUserId())
                .userName(log.getUserName())
                .timestamp(log.getTimestamp())
                .build();
    }
    
    private String getOwnerName(String ownerId) {
        return userRepository.findById(ownerId)
                .map(User::getFullName)
                .orElse("Unknown");
    }
    
    private void logActivity(ActivityLog.ActivityType type, String description, String userId, String userName) {
        ActivityLog log = ActivityLog.builder()
                .activityId(generateId())
                .type(type)
                .description(description)
                .userId(userId)
                .userName(userName)
                .timestamp(LocalDateTime.now())
                .build();
        
        activityLogRepository.save(log);
    }
    
    private String generateId() {
        return UUID.randomUUID().toString().substring(0, 12);
    }
}
