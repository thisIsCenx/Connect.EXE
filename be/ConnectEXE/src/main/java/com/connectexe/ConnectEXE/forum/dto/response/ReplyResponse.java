package com.connectexe.ConnectEXE.forum.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplyResponse {
    private String replyId;
    private String topicId;
    private String userId;
    private String authorName;
    private String content;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private String parentReplyId; // ID of parent reply (null for root replies)
    private List<ReplyResponse> children; // Nested replies
    private Integer replyCount; // Count of child replies
}
