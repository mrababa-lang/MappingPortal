package com.slashdata.mappingportal.backend.service;

import com.slashdata.mappingportal.backend.dto.BulkImportResponse;
import com.slashdata.mappingportal.backend.dto.MakeMappingRequest;
import com.slashdata.mappingportal.backend.dto.MappingUpdateRequest;
import com.slashdata.mappingportal.backend.model.ADPMakeMapping;
import com.slashdata.mappingportal.backend.model.ADPMapping;
import com.slashdata.mappingportal.backend.model.ADPMaster;
import com.slashdata.mappingportal.backend.model.Model;
import com.slashdata.mappingportal.backend.model.User;
import com.slashdata.mappingportal.backend.repository.ADPMakeMappingRepository;
import com.slashdata.mappingportal.backend.repository.ADPMappingRepository;
import com.slashdata.mappingportal.backend.repository.ADPMasterRepository;
import com.slashdata.mappingportal.backend.repository.ModelRepository;
import com.slashdata.mappingportal.backend.repository.UserRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AdpService {
    private final ADPMasterRepository adpMasterRepository;
    private final ADPMappingRepository adpMappingRepository;
    private final ADPMakeMappingRepository adpMakeMappingRepository;
    private final ModelRepository modelRepository;
    private final UserRepository userRepository;

    public AdpService(ADPMasterRepository adpMasterRepository, ADPMappingRepository adpMappingRepository, ADPMakeMappingRepository adpMakeMappingRepository, ModelRepository modelRepository, UserRepository userRepository) {
        this.adpMasterRepository = adpMasterRepository;
        this.adpMappingRepository = adpMappingRepository;
        this.adpMakeMappingRepository = adpMakeMappingRepository;
        this.modelRepository = modelRepository;
        this.userRepository = userRepository;
    }

    public List<ADPMaster> listMasterData() {
        return adpMasterRepository.findAll();
    }

    public BulkImportResponse importMasterData(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        int success = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {
            for (CSVRecord record : parser) {
                try {
                    ADPMaster master = new ADPMaster();
                    master.setId(record.get("id"));
                    master.setAdpMakeId(record.get("adp_make_id"));
                    master.setMakeArDesc(record.get("make_ar_desc"));
                    master.setMakeEnDesc(record.get("make_en_desc"));
                    master.setAdpModelId(record.get("adp_model_id"));
                    master.setModelArDesc(record.get("model_ar_desc"));
                    master.setModelEnDesc(record.get("model_en_desc"));
                    master.setAdpTypeId(record.get("adp_type_id"));
                    master.setTypeArDesc(record.get("type_ar_desc"));
                    master.setTypeEnDesc(record.get("type_en_desc"));
                    adpMasterRepository.save(master);
                    success++;
                } catch (Exception ex) {
                    errors.add("Row " + record.getRecordNumber() + ": " + ex.getMessage());
                }
            }
        }
        return new BulkImportResponse(success, errors.size(), errors);
    }

    public List<ADPMapping> listMappings() {
        return adpMappingRepository.findAll();
    }

    public List<ADPMakeMapping> listMakeMappings() {
        return adpMakeMappingRepository.findAll();
    }

    @Transactional
    public ADPMapping updateMapping(String adpId, MappingUpdateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Model model = request.getModelId() != null ? modelRepository.findById(request.getModelId()).orElse(null) : null;
        ADPMaster master = adpMasterRepository.findById(adpId).orElseThrow();
        ADPMapping mapping = adpMappingRepository.findByAdpMasterId(adpId).orElseGet(() -> {
            ADPMapping m = new ADPMapping();
            m.setId(UUID.randomUUID().toString());
            m.setAdpMaster(master);
            if (model == null) {
                throw new IllegalArgumentException("Model ID is required for new mappings");
            }
            m.setModel(model);
            return m;
        });
        if (model != null) {
            mapping.setModel(model);
        }
        mapping.setStatus(request.getStatus());
        mapping.setUpdatedBy(user);
        mapping.setUpdatedAt(Instant.now());
        return adpMappingRepository.save(mapping);
    }

    @Transactional
    public ADPMapping reviewMapping(String id, String reviewerEmail) {
        ADPMapping mapping = adpMappingRepository.findById(id).orElseThrow();
        User reviewer = userRepository.findByEmail(reviewerEmail).orElseThrow();
        mapping.setReviewedAt(Instant.now());
        mapping.setReviewedBy(reviewer);
        return adpMappingRepository.save(mapping);
    }

    @Transactional
    public ADPMakeMapping upsertMakeMapping(MakeMappingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        ADPMakeMapping mapping = adpMakeMappingRepository.findByAdpMakeId(request.getAdpMakeId()).orElseGet(() -> {
            ADPMakeMapping m = new ADPMakeMapping();
            m.setId(UUID.randomUUID().toString());
            return m;
        });
        mapping.setAdpMakeId(request.getAdpMakeId());
        mapping.setMakeId(request.getMakeId());
        ADPMakeMapping saved = adpMakeMappingRepository.save(mapping);

        // Propagation logic
        List<ADPMaster> affectedRecords = adpMasterRepository.findAll().stream()
                .filter(master -> request.getAdpMakeId().equals(master.getAdpMakeId()))
                .toList();
        for (ADPMaster master : affectedRecords) {
            adpMappingRepository.findByAdpMasterId(master.getId()).ifPresentOrElse(existing -> {
                if ("MISSING_MAKE".equals(existing.getStatus())) {
                    existing.setStatus("MISSING_MODEL");
                }
                existing.setUpdatedBy(user);
                existing.setUpdatedAt(Instant.now());
                adpMappingRepository.save(existing);
            }, () -> {
                ADPMapping newMapping = new ADPMapping();
                newMapping.setId(UUID.randomUUID().toString());
                newMapping.setAdpMaster(master);
                newMapping.setStatus("MISSING_MODEL");
                newMapping.setUpdatedBy(user);
                newMapping.setUpdatedAt(Instant.now());
                adpMappingRepository.save(newMapping);
            });
        }
        return saved;
    }
}
