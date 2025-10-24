package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "project_images")
@Data
public class ProjectImage {
    @Id
    @Column(name = "image_id", length = 12)
    private String imageId;

    @Column(name = "project_id", length = 12)
    private String projectId;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "caption")
    private String caption;
}
