package com.slashdata.mappingportal.backend.controller;

import com.slashdata.mappingportal.backend.dto.BulkImportResponse;
import com.slashdata.mappingportal.backend.model.Make;
import com.slashdata.mappingportal.backend.service.MasterDataService;
import java.io.IOException;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/makes")
public class MakeController {

    private final MasterDataService masterDataService;

    public MakeController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping
    public List<Make> listMakes() {
        return masterDataService.listMakes();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public Make createMake(@RequestBody Make make) {
        return masterDataService.createMake(make);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public Make updateMake(@PathVariable String id, @RequestBody Make make) {
        return masterDataService.updateMake(id, make);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMake(@PathVariable String id) {
        masterDataService.deleteMake(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public BulkImportResponse bulkImport(@RequestParam("file") MultipartFile file) throws IOException {
        return masterDataService.importMakesCsv(file);
    }
}
