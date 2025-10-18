package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.ForumTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumTopicRepository extends JpaRepository<ForumTopic, String> {
}
