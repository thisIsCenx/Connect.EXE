package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "skills")
@Data
public class Skill {
    @Id
    @Column(name = "skill_id", length = 12)
    private String skillId;

    @Column(name = "skill_name", length = 50, unique = true)
    private String skillName;
}
