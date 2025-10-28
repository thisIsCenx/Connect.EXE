package com.connectexe.ConnectEXE.forum.controller;

import com.connectexe.ConnectEXE.common.ApiResponse;
import com.connectexe.ConnectEXE.common.constant.RouteConst;
import com.connectexe.ConnectEXE.forum.dto.request.*;
import com.connectexe.ConnectEXE.forum.dto.response.*;
import com.connectexe.ConnectEXE.forum.service.ForumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling forum operations.
 * Provides endpoints for topics and replies management.
 */
@RestController
@RequestMapping(RouteConst.FORUM_BASE)
@Slf4j
@RequiredArgsConstructor
public class ForumController {
    
    private final ForumService forumService;

    /**
     * Get list of topics with optional filters
     * @param approved Filter by approval status (optional)
     * @param userId Filter by user ID (optional)
     * @param page Page number (default: 0)
     * @param size Page size (default: 10)
     * @return Page of topics
     */
    @GetMapping("/topics")
    public ResponseEntity<ApiResponse<Page<TopicResponse>>> getTopics(
            @RequestParam(name = RouteConst.PARAM_APPROVED, required = false) Boolean approved,
            @RequestParam(name = RouteConst.PARAM_USER_ID, required = false) String userId,
            @RequestParam(name = "isActive", required = false) Boolean isActive,
            @RequestParam(name = RouteConst.PARAM_PAGE, defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<TopicResponse> topics = forumService.getTopics(approved, userId, isActive, page, size);
            return ResponseEntity.ok(ApiResponse.success("Topics retrieved successfully", topics));
        } catch (Exception ex) {
            log.error("Error retrieving topics: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve topics"));
        }
    }

    /**
     * Create a new topic
     * @param request Topic creation request
     * @return Created topic
     */
    @PostMapping("/topics")
    public ResponseEntity<ApiResponse<TopicResponse>> createTopic(
            @Valid @RequestBody CreateTopicRequest request) {
        try {
            // Get userId from SecurityContext (set by JwtAuthenticationFilter)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }
            
            String userId = authentication.getName();
            log.info("Creating topic for user: {}", userId);
            
            TopicResponse topic = forumService.createTopic(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Topic created successfully, awaiting approval", topic));
        } catch (RuntimeException ex) {
            log.error("Error creating topic: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error creating topic: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create topic"));
        }
    }

    /**
     * Get topic details with replies
     * @param topicId Topic ID
     * @return Topic details with all replies
     */
    @GetMapping("/topics/{topicId}")
    public ResponseEntity<ApiResponse<TopicDetailResponse>> getTopicDetail(
            @PathVariable(RouteConst.API_PARAM_TOPIC_ID) String topicId) {
        try {
            TopicDetailResponse topicDetail = forumService.getTopicDetail(topicId);
            return ResponseEntity.ok(ApiResponse.success("Topic details retrieved successfully", topicDetail));
        } catch (RuntimeException ex) {
            log.error("Error retrieving topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error retrieving topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve topic details"));
        }
    }

    /**
     * Create a reply to a topic
     * @param topicId Topic ID
     * @param request Reply creation request
     * @return Created reply
     */
    @PostMapping("/topics/{topicId}/replies")
    public ResponseEntity<ApiResponse<ReplyResponse>> createReply(
            @PathVariable(RouteConst.API_PARAM_TOPIC_ID) String topicId,
            @Valid @RequestBody CreateReplyRequest request) {
        try {
            // Get userId from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }
            
            String userId = authentication.getName();
            log.info("Creating reply for topic {} by user: {}", topicId, userId);
            
            ReplyResponse reply = forumService.createReply(topicId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Reply created successfully", reply));
        } catch (RuntimeException ex) {
            log.error("Error creating reply for topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error creating reply for topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create reply"));
        }
    }

    /**
     * Approve a topic (requires teacher or admin role)
     * @param topicId Topic ID
     * @return Approved topic
     */
    @PatchMapping("/topics/{topicId}/approve")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TopicResponse>> approveTopic(
            @PathVariable(RouteConst.API_PARAM_TOPIC_ID) String topicId) {
        try {
            TopicResponse topic = forumService.approveTopic(topicId);
            return ResponseEntity.ok(ApiResponse.success("Topic approved successfully", topic));
        } catch (RuntimeException ex) {
            log.error("Error approving topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error approving topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to approve topic"));
        }
    }

    /**
     * Delete a reply (requires teacher or admin role)
     * @param replyId Reply ID
     * @return Success message
     */
    @DeleteMapping("/replies/{replyId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReply(
            @PathVariable String replyId) {
        try {
            forumService.deleteReply(replyId);
            return ResponseEntity.ok(ApiResponse.success("Reply deleted successfully", null));
        } catch (RuntimeException ex) {
            log.error("Error deleting reply {}: {}", replyId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error deleting reply {}: {}", replyId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete reply"));
        }
    }

    /**
     * Soft delete a topic (requires teacher or admin role)
     * @param topicId Topic ID
     * @return Success message
     */
    @DeleteMapping("/topics/{topicId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(
            @PathVariable(RouteConst.API_PARAM_TOPIC_ID) String topicId) {
        try {
            forumService.deleteTopic(topicId);
            return ResponseEntity.ok(ApiResponse.success("Topic deleted successfully", null));
        } catch (RuntimeException ex) {
            log.error("Error deleting topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error deleting topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete topic"));
        }
    }

    /**
     * Restore a soft-deleted topic (requires teacher or admin role)
     * @param topicId Topic ID
     * @return Success message
     */
    @PatchMapping("/topics/{topicId}/restore")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> restoreTopic(
            @PathVariable(RouteConst.API_PARAM_TOPIC_ID) String topicId) {
        try {
            forumService.restoreTopic(topicId);
            return ResponseEntity.ok(ApiResponse.success("Topic restored successfully", null));
        } catch (RuntimeException ex) {
            log.error("Error restoring topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error restoring topic {}: {}", topicId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to restore topic"));
        }
    }
}
