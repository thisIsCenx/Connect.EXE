package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteRepository extends JpaRepository<Vote, String> {
}
