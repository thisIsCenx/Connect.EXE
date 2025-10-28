package com.connectexe.ConnectEXE.forum.service;

import com.connectexe.ConnectEXE.forum.dto.request.CreateReplyRequest;
import com.connectexe.ConnectEXE.forum.dto.request.CreateTopicRequest;
import com.connectexe.ConnectEXE.forum.dto.response.ReplyResponse;
import com.connectexe.ConnectEXE.forum.dto.response.TopicDetailResponse;
import com.connectexe.ConnectEXE.forum.dto.response.TopicResponse;

import org.springframework.data.domain.Page;

public interface ForumService {
    
    /**
     * Get list of topics with optional filtering
     * @param approved Filter by approval status (optional)
     * @param userId Filter by user ID (optional)
     * @param isActive Filter by active status (optional, default true)
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return Page of topics
     */
    Page<TopicResponse> getTopics(Boolean approved, String userId, Boolean isActive, int page, int size);
    
    /**
     * Create a new topic
     * @param request Topic creation request
     * @param userId ID of the user creating the topic
     * @return Created topic response
     */
    TopicResponse createTopic(CreateTopicRequest request, String userId);
    
    /**
     * Get topic details with replies
     * @param topicId ID of the topic
     * @return Topic details with replies
     */
    TopicDetailResponse getTopicDetail(String topicId);
    
    /**
     * Create a reply to a topic
     * @param topicId ID of the topic
     * @param request Reply creation request
     * @param userId ID of the user creating the reply
     * @return Created reply response
     */
    ReplyResponse createReply(String topicId, CreateReplyRequest request, String userId);
    
    /**
     * Approve a topic (requires teacher/admin role)
     * @param topicId ID of the topic to approve
     * @return Approved topic response
     */
    TopicResponse approveTopic(String topicId);
    
    /**
     * Delete a reply (requires teacher/admin role)
     * @param replyId ID of the reply to delete
     */
    void deleteReply(String replyId);
    
    /**
     * Soft delete a topic (requires teacher/admin role)
     * Sets isActive to false instead of hard delete
     * @param topicId ID of the topic to delete
     */
    void deleteTopic(String topicId);
    
    /**
     * Restore a soft-deleted topic (requires teacher/admin role)
     * Sets isActive back to true
     * @param topicId ID of the topic to restore
     */
    void restoreTopic(String topicId);
}
