package com.connectexe.ConnectEXE.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProjectDTO {
    private String projectId;
    private String title;
    private String description;
    private String owner;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
