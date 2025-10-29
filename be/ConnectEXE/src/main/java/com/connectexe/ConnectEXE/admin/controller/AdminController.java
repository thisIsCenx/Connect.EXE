package com.connectexe.ConnectEXE.admin.controller;

import com.connectexe.ConnectEXE.admin.dto.request.ApproveProjectRequestDTO;
import com.connectexe.ConnectEXE.admin.dto.request.UpdateUserStatusRequestDTO;
import com.connectexe.ConnectEXE.admin.dto.response.*;
import com.connectexe.ConnectEXE.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    /**
     * Get dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboardStats() {
        DashboardStatsResponseDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get users list with pagination and filters
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<UserListResponseDTO> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchQuery
    ) {
        // Create pageable with sorting
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.isEmpty()) {
            sort = "desc".equalsIgnoreCase(sortOrder) ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        UserListResponseDTO users = adminService.getUsers(pageable, role, status, searchQuery);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Update user status
     * PUT /api/admin/users/{userId}/status
     */
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, Object>> updateUserStatus(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserStatusRequestDTO request
    ) {
        request.setUserId(userId); // Set userId from path variable
        String message = adminService.updateUserStatus(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get projects list with pagination and filters
     * GET /api/admin/projects
     */
    @GetMapping("/projects")
    public ResponseEntity<ProjectListResponseDTO> getProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchQuery
    ) {
        // Create pageable with sorting
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.isEmpty()) {
            sort = "desc".equalsIgnoreCase(sortOrder) ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        ProjectListResponseDTO projects = adminService.getProjects(pageable, status, searchQuery);
        return ResponseEntity.ok(projects);
    }
    
    /**
     * Approve or reject a project
     * POST /api/admin/projects/{projectId}/approve
     */
    @PostMapping("/projects/{projectId}/approve")
    public ResponseEntity<Map<String, Object>> approveProject(
            @PathVariable String projectId,
            @Valid @RequestBody ApproveProjectRequestDTO request
    ) {
        request.setProjectId(projectId); // Set projectId from path variable
        String message = adminService.approveProject(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recent activities
     * GET /api/admin/activities/recent
     */
    @GetMapping("/activities/recent")
    public ResponseEntity<RecentActivitiesResponseDTO> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit
    ) {
        RecentActivitiesResponseDTO activities = adminService.getRecentActivities(limit);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Delete a user
     * DELETE /api/admin/users/{userId}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        String message = adminService.deleteUser(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete a project
     * DELETE /api/admin/projects/{projectId}
     */
    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<Map<String, Object>> deleteProject(@PathVariable String projectId) {
        String message = adminService.deleteProject(projectId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Global exception handler for this controller
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", e.getMessage());
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.badRequest().body(response);
    }
}
