package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, String> {
    
    // Find vote by user and project
    Optional<Vote> findByUserIdAndProjectId(String userId, String projectId);
    
    // Check if user has voted for a project
    boolean existsByUserIdAndProjectId(String userId, String projectId);
    
    // Count total votes for a project (only upvotes)
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.projectId = :projectId AND v.isUpvote = true")
    long countUpvotesByProjectId(@Param("projectId") String projectId);
    
    // Delete vote by user and project
    void deleteByUserIdAndProjectId(String userId, String projectId);
}
