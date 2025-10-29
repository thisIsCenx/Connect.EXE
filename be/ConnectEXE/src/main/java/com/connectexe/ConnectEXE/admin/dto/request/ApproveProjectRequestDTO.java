package com.connectexe.ConnectEXE.admin.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveProjectRequestDTO {
    @NotBlank(message = "Project ID is required")
    private String projectId;
    
    @NotNull(message = "Approved status is required")
    private Boolean approved;
    
    private String reason;
}
