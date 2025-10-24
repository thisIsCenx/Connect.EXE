package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.MarketplaceProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceProjectRepository extends JpaRepository<MarketplaceProject, String> {
}
