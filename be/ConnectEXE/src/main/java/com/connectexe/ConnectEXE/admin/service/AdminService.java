package com.connectexe.ConnectEXE.admin.service;

import com.connectexe.ConnectEXE.admin.dto.request.ApproveProjectRequestDTO;
import com.connectexe.ConnectEXE.admin.dto.request.UpdateUserStatusRequestDTO;
import com.connectexe.ConnectEXE.admin.dto.response.*;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    
    /**
     * Get dashboard statistics
     * @return DashboardStatsResponseDTO
     */
    DashboardStatsResponseDTO getDashboardStats();
    
    /**
     * Get users list with pagination and filters
     * @param pageable Pageable object
     * @param role Filter by role (optional)
     * @param status Filter by status (optional)
     * @param searchQuery Search by name/email (optional)
     * @return UserListResponseDTO
     */
    UserListResponseDTO getUsers(Pageable pageable, String role, String status, String searchQuery);
    
    /**
     * Update user status
     * @param request UpdateUserStatusRequestDTO
     * @return Success message
     */
    String updateUserStatus(UpdateUserStatusRequestDTO request);
    
    /**
     * Get projects list with pagination and filters
     * @param pageable Pageable object
     * @param status Filter by status (optional)
     * @param searchQuery Search by title (optional)
     * @return ProjectListResponseDTO
     */
    ProjectListResponseDTO getProjects(Pageable pageable, String status, String searchQuery);
    
    /**
     * Approve or reject a project
     * @param request ApproveProjectRequestDTO
     * @return Success message
     */
    String approveProject(ApproveProjectRequestDTO request);
    
    /**
     * Get recent activities
     * @param limit Number of activities to return
     * @return RecentActivitiesResponseDTO
     */
    RecentActivitiesResponseDTO getRecentActivities(int limit);
    
    /**
     * Delete a user
     * @param userId User ID
     * @return Success message
     */
    String deleteUser(String userId);
    
    /**
     * Delete a project
     * @param projectId Project ID
     * @return Success message
     */
    String deleteProject(String projectId);
}
