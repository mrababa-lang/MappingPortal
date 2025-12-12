package com.slashdata.mappingportal.backend.repository;

import com.slashdata.mappingportal.backend.model.ADPMakeMapping;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ADPMakeMappingRepository extends JpaRepository<ADPMakeMapping, String> {
    Optional<ADPMakeMapping> findByAdpMakeId(String adpMakeId);
}
