package com.slashdata.mappingportal.backend.repository;

import com.slashdata.mappingportal.backend.model.VehicleType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleTypeRepository extends JpaRepository<VehicleType, String> {
    Optional<VehicleType> findByNameIgnoreCase(String name);
}
