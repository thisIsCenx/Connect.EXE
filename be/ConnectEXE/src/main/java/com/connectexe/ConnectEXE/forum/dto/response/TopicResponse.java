package com.connectexe.ConnectEXE.forum.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private String topicId;
    private String title;
    private String userId;
    private String authorName;
    private String content;
    private Boolean approved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer replyCount;
}
