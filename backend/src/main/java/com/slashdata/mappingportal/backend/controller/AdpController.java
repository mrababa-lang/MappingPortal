package com.slashdata.mappingportal.backend.controller;

import com.slashdata.mappingportal.backend.dto.BulkImportResponse;
import com.slashdata.mappingportal.backend.dto.MakeMappingRequest;
import com.slashdata.mappingportal.backend.dto.MappingUpdateRequest;
import com.slashdata.mappingportal.backend.model.ADPMakeMapping;
import com.slashdata.mappingportal.backend.model.ADPMapping;
import com.slashdata.mappingportal.backend.model.ADPMaster;
import com.slashdata.mappingportal.backend.service.AdpService;
import java.io.IOException;
import java.security.Principal;
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
@RequestMapping("/api/adp")
public class AdpController {

    private final AdpService adpService;

    public AdpController(AdpService adpService) {
        this.adpService = adpService;
    }

    @GetMapping("/master")
    public List<ADPMaster> listMaster() {
        return adpService.listMasterData();
    }

    @PostMapping("/master/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public BulkImportResponse importMaster(@RequestParam("file") MultipartFile file) throws IOException {
        return adpService.importMasterData(file);
    }

    @GetMapping("/mappings")
    public List<ADPMapping> listMappings() {
        return adpService.listMappings();
    }

    @PutMapping("/mappings/{adpId}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ADPMapping updateMapping(@PathVariable String adpId, @RequestBody MappingUpdateRequest request, Principal principal) {
        return adpService.updateMapping(adpId, request, principal.getName());
    }

    @PostMapping("/mappings/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ADPMapping reviewMapping(@PathVariable String id, Principal principal) {
        return adpService.reviewMapping(id, principal.getName());
    }

    @GetMapping("/makes/mappings")
    public List<ADPMakeMapping> makeMappings() {
        return adpService.listMakeMappings();
    }

    @PostMapping("/makes/mappings")
    @PreAuthorize("hasAnyRole('ADMIN','EDITOR')")
    public ADPMakeMapping upsertMakeMapping(@RequestBody MakeMappingRequest request, Principal principal) {
        return adpService.upsertMakeMapping(request, principal.getName());
    }
}
