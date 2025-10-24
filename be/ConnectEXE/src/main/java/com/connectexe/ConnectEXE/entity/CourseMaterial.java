package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_materials")
@Data
public class CourseMaterial {
    @Id
    @Column(name = "material_id", length = 12)
    private String materialId;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "content")
    private String content;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
