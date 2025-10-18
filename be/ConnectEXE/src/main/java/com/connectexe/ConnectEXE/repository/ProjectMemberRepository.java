package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.ProjectMember;
import com.connectexe.ConnectEXE.entity.ProjectMember.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
}
