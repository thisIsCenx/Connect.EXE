package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_projects")
@Data
public class MarketplaceProject {
    @Id
    @Column(name = "marketplace_id", length = 12)
    private String marketplaceId;

    @Column(name = "project_id", length = 12)
    private String projectId;

    @Column(name = "listed_by", length = 12)
    private String listedBy;

    @Column(name = "price")
    private Double price;

    @Column(name = "listed_at")
    private LocalDateTime listedAt;
}
