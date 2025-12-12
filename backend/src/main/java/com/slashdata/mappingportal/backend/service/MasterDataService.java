package com.slashdata.mappingportal.backend.service;

import com.slashdata.mappingportal.backend.dto.BulkImportResponse;
import com.slashdata.mappingportal.backend.model.Make;
import com.slashdata.mappingportal.backend.model.Model;
import com.slashdata.mappingportal.backend.model.VehicleType;
import com.slashdata.mappingportal.backend.repository.MakeRepository;
import com.slashdata.mappingportal.backend.repository.ModelRepository;
import com.slashdata.mappingportal.backend.repository.VehicleTypeRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MasterDataService {

    private final MakeRepository makeRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ModelRepository modelRepository;

    public MasterDataService(MakeRepository makeRepository, VehicleTypeRepository vehicleTypeRepository, ModelRepository modelRepository) {
        this.makeRepository = makeRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.modelRepository = modelRepository;
    }

    public List<Make> listMakes() {
        return makeRepository.findAll();
    }

    public Make createMake(Make make) {
        if (make.getId() == null) {
            make.setId(UUID.randomUUID().toString());
        }
        return makeRepository.save(make);
    }

    public void deleteMake(String id) {
        makeRepository.deleteById(id);
    }

    public Make updateMake(String id, Make updated) {
        Make existing = makeRepository.findById(id).orElseThrow();
        existing.setName(updated.getName());
        existing.setCountry(updated.getCountry());
        return makeRepository.save(existing);
    }

    public List<VehicleType> listTypes() {
        return vehicleTypeRepository.findAll();
    }

    public VehicleType createType(VehicleType type) {
        if (type.getId() == null) {
            type.setId(UUID.randomUUID().toString());
        }
        return vehicleTypeRepository.save(type);
    }

    public VehicleType updateType(String id, VehicleType type) {
        VehicleType existing = vehicleTypeRepository.findById(id).orElseThrow();
        existing.setName(type.getName());
        existing.setDescription(type.getDescription());
        return vehicleTypeRepository.save(existing);
    }

    public List<Model> listModels(String makeId) {
        if (makeId != null) {
            return modelRepository.findByMakeId(makeId);
        }
        return modelRepository.findAll();
    }

    public Model createModel(Model model) {
        if (model.getId() == null) {
            model.setId(UUID.randomUUID().toString());
        }
        return modelRepository.save(model);
    }

    public Model updateModel(String id, Model payload) {
        Model model = modelRepository.findById(id).orElseThrow();
        model.setName(payload.getName());
        model.setMake(payload.getMake());
        model.setType(payload.getType());
        return modelRepository.save(model);
    }

    public BulkImportResponse importMakesCsv(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        int success = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {
            for (CSVRecord record : parser) {
                try {
                    Make make = new Make();
                    make.setId(UUID.randomUUID().toString());
                    make.setName(record.get("name"));
                    make.setCountry(record.get("country"));
                    makeRepository.save(make);
                    success++;
                } catch (Exception ex) {
                    errors.add("Row " + record.getRecordNumber() + ": " + ex.getMessage());
                }
            }
        }
        return new BulkImportResponse(success, errors.size(), errors);
    }

    public BulkImportResponse importTypesCsv(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        int success = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {
            for (CSVRecord record : parser) {
                try {
                    VehicleType type = new VehicleType();
                    type.setId(UUID.randomUUID().toString());
                    type.setName(record.get("name"));
                    type.setDescription(record.get("description"));
                    vehicleTypeRepository.save(type);
                    success++;
                } catch (Exception ex) {
                    errors.add("Row " + record.getRecordNumber() + ": " + ex.getMessage());
                }
            }
        }
        return new BulkImportResponse(success, errors.size(), errors);
    }

    public BulkImportResponse importModelsCsv(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        int success = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader)) {
            for (CSVRecord record : parser) {
                try {
                    String makeName = record.get("make_name");
                    String typeName = record.get("type_name");
                    Make make = makeRepository.findByNameIgnoreCase(makeName).orElseThrow(() -> new IllegalArgumentException("Make '" + makeName + "' not found"));
                    VehicleType type = vehicleTypeRepository.findByNameIgnoreCase(typeName).orElseThrow(() -> new IllegalArgumentException("Type '" + typeName + "' not found"));
                    Model model = new Model();
                    model.setId(UUID.randomUUID().toString());
                    model.setName(record.get("name"));
                    model.setMake(make);
                    model.setType(type);
                    modelRepository.save(model);
                    success++;
                } catch (Exception ex) {
                    errors.add("Row " + record.getRecordNumber() + ": " + ex.getMessage());
                }
            }
        }
        return new BulkImportResponse(success, errors.size(), errors);
    }
}
