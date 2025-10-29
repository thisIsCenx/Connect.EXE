package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    
    // Find by status with pagination
    Page<Project> findByStatusAndIsPublic(Project.ProjectStatus status, Boolean isPublic, Pageable pageable);
    
    // Find by category with pagination
    Page<Project> findByCategoryAndIsPublic(Project.ProjectCategory category, Boolean isPublic, Pageable pageable);
    
    // Find all public projects
    Page<Project> findByIsPublic(Boolean isPublic, Pageable pageable);
    
    // Find random projects from subscribed users
    @Query(value = "SELECT p.* FROM projects p " +
            "WHERE p.owner_id IN (" +
            "  SELECT s.subscribed_to_id FROM subscriptions s " +
            "  WHERE s.subscriber_id = :userId AND s.status = 'ACTIVE'" +
            ") " +
            "AND p.is_public = true " +
            "ORDER BY RANDOM() " +
            "LIMIT :limit", 
            nativeQuery = true)
    List<Project> findRandomProjectsFromSubscriptions(@Param("userId") String userId, @Param("limit") int limit);
    
    // Find projects with vote counts (for voting page)
    @Query("SELECT p, COUNT(v) as voteCount FROM Project p " +
           "LEFT JOIN Vote v ON v.projectId = p.projectId AND v.isUpvote = true " +
           "WHERE p.isPublic = true " +
           "GROUP BY p " +
           "ORDER BY voteCount DESC")
    Page<Object[]> findProjectsWithVoteCounts(Pageable pageable);
    
    // Find projects by owner
    Page<Project> findByOwnerId(String ownerId, Pageable pageable);
}
