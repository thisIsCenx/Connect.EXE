package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
}
