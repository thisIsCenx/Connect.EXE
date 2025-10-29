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
public class ActivityLogDTO {
    private String activityId;
    private String type;
    private String description;
    private String userId;
    private String userName;
    private LocalDateTime timestamp;
}
