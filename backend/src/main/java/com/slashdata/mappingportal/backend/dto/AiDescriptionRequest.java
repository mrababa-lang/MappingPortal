package com.slashdata.mappingportal.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AiDescriptionRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String context;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }
}
