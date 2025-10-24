package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "role_permissions")
@IdClass(RolePermission.RolePermissionId.class)
@Data
public class RolePermission {

    @Id
    @Column(name = "role", length = 20)
    private String role;

    @Id
    @Column(name = "permission_id", length = 12)
    private String permissionId;

    // Constructor, getters, setters được tự động generate từ Lombok @Data

    /**
     * Class này dùng làm khóa chính phức hợp, gồm role và permissionId
     */
    public static class RolePermissionId implements Serializable {

        private String role;
        private String permissionId;

        // Phương thức để phục vụ cho equals và hashCode
        public RolePermissionId() { }

        public RolePermissionId(String role, String permissionId) {
            this.role = role;
            this.permissionId = permissionId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof RolePermissionId)) return false;
            RolePermissionId that = (RolePermissionId) o;
            return Objects.equals(role, that.role) && Objects.equals(permissionId, that.permissionId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(role, permissionId);
        }
    }
}
