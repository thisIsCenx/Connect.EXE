package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

@Entity
@Table(name = "project_members")
@IdClass(ProjectMember.ProjectMemberId.class)
@Data
public class ProjectMember {
    @Id
    @Column(name = "project_id", length = 12)
    private String projectId;

    @Id
    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "role", length = 20)
    private String role;

    @Data
    public static class ProjectMemberId implements Serializable {
        private String projectId;
        private String userId;
    }
}
