package com.slashdata.mappingportal.backend.controller;

import com.slashdata.mappingportal.backend.dto.BulkImportResponse;
import com.slashdata.mappingportal.backend.model.VehicleType;
import com.slashdata.mappingportal.backend.service.MasterDataService;
import java.io.IOException;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/types")
public class VehicleTypeController {

    private final MasterDataService masterDataService;

    public VehicleTypeController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping
    public List<VehicleType> listTypes() {
        return masterDataService.listTypes();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public VehicleType createType(@RequestBody VehicleType type) {
        return masterDataService.createType(type);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public VehicleType updateType(@PathVariable String id, @RequestBody VehicleType type) {
        return masterDataService.updateType(id, type);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public BulkImportResponse bulkImport(@RequestParam("file") MultipartFile file) throws IOException {
        return masterDataService.importTypesCsv(file);
    }
}
