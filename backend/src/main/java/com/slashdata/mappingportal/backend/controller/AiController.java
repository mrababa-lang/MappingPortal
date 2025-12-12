package com.slashdata.mappingportal.backend.controller;

import com.slashdata.mappingportal.backend.dto.AiDescriptionRequest;
import com.slashdata.mappingportal.backend.dto.AiSuggestModelsRequest;
import com.slashdata.mappingportal.backend.service.AiService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-description")
    public Map<String, String> generateDescription(@Valid @RequestBody AiDescriptionRequest request) {
        return aiService.generateDescription(request.getName(), request.getContext());
    }

    @PostMapping("/suggest-models")
    public Map<String, ?> suggestModels(@Valid @RequestBody AiSuggestModelsRequest request) {
        return aiService.suggestModels(request.getMakeName());
    }
}
