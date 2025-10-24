package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
}
