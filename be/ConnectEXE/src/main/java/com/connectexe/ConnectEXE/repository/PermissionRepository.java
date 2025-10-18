package com.connectexe.ConnectEXE.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.connectexe.ConnectEXE.entity.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, String> {
}