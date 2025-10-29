package com.connectexe.ConnectEXE.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponseDTO {
    private Long totalUsers;
    private Long totalProjects;
    private Long totalTopics;
    private Long totalReplies;
    private Long pendingProjects;
    private Long activeUsers;
    private Long projectsThisMonth;
    private Long topicsThisMonth;
}
