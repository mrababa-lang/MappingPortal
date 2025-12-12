package com.slashdata.mappingportal.backend.repository;

import com.slashdata.mappingportal.backend.model.ADPMapping;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ADPMappingRepository extends JpaRepository<ADPMapping, String> {
    Optional<ADPMapping> findByAdpMasterId(String adpId);
    List<ADPMapping> findByUpdatedById(String userId);
}
