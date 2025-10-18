package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.ForumReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumReplyRepository extends JpaRepository<ForumReply, String> {
}
