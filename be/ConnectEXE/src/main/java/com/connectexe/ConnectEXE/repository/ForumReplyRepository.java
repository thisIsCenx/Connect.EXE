package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.ForumReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumReplyRepository extends JpaRepository<ForumReply, String> {
    
    // Find all replies for a specific topic
    List<ForumReply> findByTopicIdOrderByCreatedAtAsc(String topicId);
    
    // Find only root-level replies (no parent) for a topic
    List<ForumReply> findByTopicIdAndParentReplyIdIsNullOrderByCreatedAtAsc(String topicId);
    
    // Find child replies of a specific parent reply
    List<ForumReply> findByParentReplyIdOrderByCreatedAtAsc(String parentReplyId);
    
    // Count all replies for a topic (including nested)
    Long countByTopicId(String topicId);
    
    // Count root-level replies only
    Long countByTopicIdAndParentReplyIdIsNull(String topicId);
}
