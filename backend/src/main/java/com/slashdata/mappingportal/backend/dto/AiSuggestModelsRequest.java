package com.slashdata.mappingportal.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AiSuggestModelsRequest {
    @NotBlank
    private String makeName;

    public String getMakeName() {
        return makeName;
    }

    public void setMakeName(String makeName) {
        this.makeName = makeName;
    }
}
