package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {
    
    /**
     * Find recent activities with pagination
     * @param pageable Pageable object
     * @return Page of ActivityLog
     */
    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);
    
    /**
     * Find recent activities by user ID
     * @param userId User ID
     * @param pageable Pageable object
     * @return Page of ActivityLog
     */
    Page<ActivityLog> findByUserIdOrderByTimestampDesc(String userId, Pageable pageable);
    
    /**
     * Find recent activities with limit
     * @param pageable Pageable object with limit
     * @return List of ActivityLog
     */
    @Query("SELECT a FROM ActivityLog a ORDER BY a.timestamp DESC")
    List<ActivityLog> findRecentActivities(Pageable pageable);
}
