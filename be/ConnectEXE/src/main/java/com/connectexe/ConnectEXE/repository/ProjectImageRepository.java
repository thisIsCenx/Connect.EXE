package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.ProjectImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectImageRepository extends JpaRepository<ProjectImage, String> {
}
