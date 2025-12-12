package com.slashdata.mappingportal.backend.repository;

import com.slashdata.mappingportal.backend.model.Make;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MakeRepository extends JpaRepository<Make, String> {
    Optional<Make> findByNameIgnoreCase(String name);
}
