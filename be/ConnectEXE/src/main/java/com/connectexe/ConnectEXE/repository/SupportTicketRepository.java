package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, String> {
}
