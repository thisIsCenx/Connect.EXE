package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.ForumTopic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumTopicRepository extends JpaRepository<ForumTopic, String> {
    
    // Find all active topics with optional filtering
    Page<ForumTopic> findByIsActive(Boolean isActive, Pageable pageable);
    
    // Find topics by approved status and active
    Page<ForumTopic> findByApprovedAndIsActive(Boolean approved, Boolean isActive, Pageable pageable);
    
    // Find topics by userId and active
    Page<ForumTopic> findByUserIdAndIsActive(String userId, Boolean isActive, Pageable pageable);
    
    // Find topics by userId, approved status and active
    Page<ForumTopic> findByUserIdAndApprovedAndIsActive(String userId, Boolean approved, Boolean isActive, Pageable pageable);
    
    // Legacy methods (deprecated - should filter by isActive)
    @Deprecated
    Page<ForumTopic> findAll(Pageable pageable);
    
    @Deprecated
    Page<ForumTopic> findByApproved(Boolean approved, Pageable pageable);
    
    @Deprecated
    Page<ForumTopic> findByUserId(String userId, Pageable pageable);
    
    @Deprecated
    Page<ForumTopic> findByUserIdAndApproved(String userId, Boolean approved, Pageable pageable);
    
    // Custom query to count replies for a topic
    @Query("SELECT COUNT(fr) FROM ForumReply fr WHERE fr.topicId = :topicId")
    Long countRepliesByTopicId(@Param("topicId") String topicId);
}
