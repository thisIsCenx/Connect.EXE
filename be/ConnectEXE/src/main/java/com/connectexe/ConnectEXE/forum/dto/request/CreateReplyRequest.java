package com.connectexe.ConnectEXE.forum.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReplyRequest {
    
    @NotBlank(message = "Content is required")
    private String content;
    
    // Optional: ID of parent reply for nested replies
    private String parentReplyId;
}
