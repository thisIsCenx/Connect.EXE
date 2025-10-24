package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "permissions")
@Data
public class Permission {
    @Id
    @Column(name = "permission_id", length = 12)
    private String permissionId;

    @Column(name = "permission_name", length = 100, unique = true, nullable = false)
    private String permissionName;

    @Column(name = "description")
    private String description;

}