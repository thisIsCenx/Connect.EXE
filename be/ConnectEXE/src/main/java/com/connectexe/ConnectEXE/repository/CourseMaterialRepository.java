package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, String> {
}
