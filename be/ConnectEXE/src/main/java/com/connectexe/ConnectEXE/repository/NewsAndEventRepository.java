package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.NewsAndEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsAndEventRepository extends JpaRepository<NewsAndEvent, String> {
}
