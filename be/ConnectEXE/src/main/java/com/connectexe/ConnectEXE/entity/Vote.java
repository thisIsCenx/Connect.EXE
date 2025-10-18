package com.connectexe.ConnectEXE.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "votes")
@Data
public class Vote {
    @Id
    @Column(name = "vote_id", length = 12)
    private String voteId;

    @Column(name = "user_id", length = 12)
    private String userId;

    @Column(name = "project_id", length = 12)
    private String projectId;

    @Column(name = "is_upvote")
    private Boolean isUpvote;
}
