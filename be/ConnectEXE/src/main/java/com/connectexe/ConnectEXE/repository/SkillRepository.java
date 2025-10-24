package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillRepository extends JpaRepository<Skill, String> {
}
