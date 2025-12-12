package com.slashdata.mappingportal.backend.controller;

import com.slashdata.mappingportal.backend.dto.BulkImportResponse;
import com.slashdata.mappingportal.backend.model.Model;
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
@RequestMapping("/api/models")
public class ModelController {

    private final MasterDataService masterDataService;

    public ModelController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping
    public List<Model> listModels(@RequestParam(value = "makeId", required = false) String makeId) {
        return masterDataService.listModels(makeId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public Model createModel(@RequestBody Model model) {
        return masterDataService.createModel(model);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public Model updateModel(@PathVariable String id, @RequestBody Model payload) {
        return masterDataService.updateModel(id, payload);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public BulkImportResponse bulkImport(@RequestParam("file") MultipartFile file) throws IOException {
        return masterDataService.importModelsCsv(file);
    }
}
