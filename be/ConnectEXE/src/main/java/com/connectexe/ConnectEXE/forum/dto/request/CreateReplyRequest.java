package com.connectexe.ConnectEXE.forum.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateReplyRequest {
    
    @NotBlank(message = "Content is required")
    private String content;
    
    // Optional: ID of parent reply for nested replies
    private String parentReplyId;
    
    /**
     * Optional list of image URLs from Cloudinary
     * Maximum 5 images allowed
     */
    @Size(max = 5, message = "Maximum 5 images allowed")
    private List<String> imageUrls;
}
