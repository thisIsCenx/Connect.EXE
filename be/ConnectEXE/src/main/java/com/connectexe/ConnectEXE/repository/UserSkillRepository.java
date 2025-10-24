package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.UserSkill;
import com.connectexe.ConnectEXE.entity.UserSkill.UserSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, UserSkillId> {
}
