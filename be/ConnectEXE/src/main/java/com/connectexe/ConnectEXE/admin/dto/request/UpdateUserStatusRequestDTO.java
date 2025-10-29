package com.connectexe.ConnectEXE.admin.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequestDTO {
    // userId is set from @PathVariable, no validation needed
    private String userId;
    
    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, INACTIVE, SUSPENDED
}
