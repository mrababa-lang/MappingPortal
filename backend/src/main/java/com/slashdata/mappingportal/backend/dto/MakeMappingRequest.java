package com.slashdata.mappingportal.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class MakeMappingRequest {
    @NotBlank
    private String adpMakeId;

    @NotBlank
    private String makeId;

    public String getAdpMakeId() {
        return adpMakeId;
    }

    public void setAdpMakeId(String adpMakeId) {
        this.adpMakeId = adpMakeId;
    }

    public String getMakeId() {
        return makeId;
    }

    public void setMakeId(String makeId) {
        this.makeId = makeId;
    }
}
