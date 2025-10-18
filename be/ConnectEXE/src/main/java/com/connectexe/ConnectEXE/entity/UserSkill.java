package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

@Entity
@Table(name = "user_skills")
@IdClass(UserSkill.UserSkillId.class)
@Data
public class UserSkill {
    @Id
    @Column(name = "user_id", length = 12)
    private String userId;

    @Id
    @Column(name = "skill_id", length = 12)
    private String skillId;

    @Data
    public static class UserSkillId implements Serializable {
        private String userId;
        private String skillId;
    }
}
