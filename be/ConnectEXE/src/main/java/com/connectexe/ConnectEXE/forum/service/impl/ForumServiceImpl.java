package com.connectexe.ConnectEXE.forum.service.impl;

import com.connectexe.ConnectEXE.entity.ForumReply;
import com.connectexe.ConnectEXE.entity.ForumTopic;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.forum.dto.request.*;
import com.connectexe.ConnectEXE.forum.dto.response.*;
import com.connectexe.ConnectEXE.forum.service.ForumService;
import com.connectexe.ConnectEXE.repository.ForumReplyRepository;
import com.connectexe.ConnectEXE.repository.ForumTopicRepository;
import com.connectexe.ConnectEXE.repository.UserRepository;
import com.connectexe.ConnectEXE.util.IdUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumServiceImpl implements ForumService {

    private final ForumTopicRepository topicRepository;
    private final ForumReplyRepository replyRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<TopicResponse> getTopics(Boolean approved, String userId, Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<ForumTopic> topics;
        
        // Default to showing only active topics if not specified
        Boolean activeFilter = (isActive != null) ? isActive : true;
        
        // Apply filters based on parameters
        if (approved != null && userId != null) {
            topics = topicRepository.findByUserIdAndApprovedAndIsActive(userId, approved, activeFilter, pageable);
        } else if (approved != null) {
            topics = topicRepository.findByApprovedAndIsActive(approved, activeFilter, pageable);
        } else if (userId != null) {
            topics = topicRepository.findByUserIdAndIsActive(userId, activeFilter, pageable);
        } else {
            topics = topicRepository.findByIsActive(activeFilter, pageable);
        }
        
        return topics.map(this::convertToTopicResponse);
    }

    @Override
    @Transactional
    public TopicResponse createTopic(CreateTopicRequest request, String userId) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create new topic
        ForumTopic topic = new ForumTopic();
        topic.setTopicId(IdUtil.randomHex(12));
        topic.setTitle(request.getTitle());
        topic.setContent(request.getContent());
        topic.setUserId(userId);
        topic.setApproved(false); // Default to false, awaiting approval
        topic.setCreatedAt(LocalDateTime.now());
        topic.setUpdatedAt(LocalDateTime.now());
        
        ForumTopic savedTopic = topicRepository.save(topic);
        
        return convertToTopicResponse(savedTopic);
    }

    @Override
    @Transactional(readOnly = true)
    public TopicDetailResponse getTopicDetail(String topicId) {
        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        
        // Get only root-level replies (those without parent)
        List<ForumReply> rootReplies = replyRepository.findByTopicIdAndParentReplyIdIsNullOrderByCreatedAtAsc(topicId);
        
        // Convert to response with nested structure
        List<ReplyResponse> replyResponses = rootReplies.stream()
                .map(this::convertToReplyResponseWithChildren)
                .collect(Collectors.toList());
        
        // Get author name
        String authorName = getUserName(topic.getUserId());
        
        return TopicDetailResponse.builder()
                .topicId(topic.getTopicId())
                .title(topic.getTitle())
                .userId(topic.getUserId())
                .authorName(authorName)
                .content(topic.getContent())
                .approved(topic.getApproved())
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .replies(replyResponses)
                .build();
    }

    @Override
    @Transactional
    public ReplyResponse createReply(String topicId, CreateReplyRequest request, String userId) {
        // Validate topic exists
        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // If parent reply exists, validate it
        if (request.getParentReplyId() != null && !request.getParentReplyId().isEmpty()) {
            ForumReply parentReply = replyRepository.findById(request.getParentReplyId())
                    .orElseThrow(() -> new RuntimeException("Parent reply not found"));
            
            // Validate parent reply belongs to the same topic
            if (!parentReply.getTopicId().equals(topicId)) {
                throw new RuntimeException("Parent reply does not belong to this topic");
            }
        }
        
        // Create new reply
        ForumReply reply = new ForumReply();
        reply.setReplyId(IdUtil.randomHex(12));
        reply.setTopicId(topicId);
        reply.setUserId(userId);
        reply.setContent(request.getContent());
        reply.setParentReplyId(request.getParentReplyId()); // Set parent reply ID
        reply.setCreatedAt(LocalDateTime.now());
        
        ForumReply savedReply = replyRepository.save(reply);
        
        return convertToReplyResponse(savedReply);
    }

    @Override
    @Transactional
    public TopicResponse approveTopic(String topicId) {
        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        
        // Set approved to true
        topic.setApproved(true);
        topic.setUpdatedAt(LocalDateTime.now());
        
        ForumTopic updatedTopic = topicRepository.save(topic);
        
        return convertToTopicResponse(updatedTopic);
    }

    // Helper methods to convert entities to DTOs
    private TopicResponse convertToTopicResponse(ForumTopic topic) {
        String authorName = getUserName(topic.getUserId());
        Long replyCount = replyRepository.countByTopicId(topic.getTopicId());
        
        return TopicResponse.builder()
                .topicId(topic.getTopicId())
                .title(topic.getTitle())
                .userId(topic.getUserId())
                .authorName(authorName)
                .content(topic.getContent())
                .approved(topic.getApproved())
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .replyCount(replyCount != null ? replyCount.intValue() : 0)
                .build();
    }

    private ReplyResponse convertToReplyResponse(ForumReply reply) {
        String authorName = getUserName(reply.getUserId());
        
        return ReplyResponse.builder()
                .replyId(reply.getReplyId())
                .topicId(reply.getTopicId())
                .userId(reply.getUserId())
                .authorName(authorName)
                .content(reply.getContent())
                .createdAt(reply.getCreatedAt())
                .parentReplyId(reply.getParentReplyId())
                .build();
    }

    /**
     * Converts a ForumReply to ReplyResponse with nested children
     */
    private ReplyResponse convertToReplyResponseWithChildren(ForumReply reply) {
        String authorName = getUserName(reply.getUserId());
        
        // Get child replies
        List<ForumReply> childReplies = replyRepository.findByParentReplyIdOrderByCreatedAtAsc(reply.getReplyId());
        
        // Recursively convert children
        List<ReplyResponse> children = childReplies.stream()
                .map(this::convertToReplyResponseWithChildren)
                .collect(Collectors.toList());
        
        return ReplyResponse.builder()
                .replyId(reply.getReplyId())
                .topicId(reply.getTopicId())
                .userId(reply.getUserId())
                .authorName(authorName)
                .content(reply.getContent())
                .createdAt(reply.getCreatedAt())
                .parentReplyId(reply.getParentReplyId())
                .children(children)
                .replyCount(children.size())
                .build();
    }

    private String getUserName(String userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse("Unknown User");
    }

    @Override
    @Transactional
    public void deleteReply(String replyId) {
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        
        replyRepository.delete(reply);
    }

    @Override
    @Transactional
    public void deleteTopic(String topicId) {
        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        
        // Soft delete: set isActive to false
        topic.setIsActive(false);
        topicRepository.save(topic);
    }

    @Override
    @Transactional
    public void restoreTopic(String topicId) {
        ForumTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        
        // Restore: set isActive back to true
        topic.setIsActive(true);
        topicRepository.save(topic);
    }
}
