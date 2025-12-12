package com.slashdata.mappingportal.backend.repository;

import com.slashdata.mappingportal.backend.model.Model;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModelRepository extends JpaRepository<Model, String> {
    List<Model> findByMakeId(String makeId);
}
