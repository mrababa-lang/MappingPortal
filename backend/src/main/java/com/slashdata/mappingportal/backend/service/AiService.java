package com.slashdata.mappingportal.backend.service;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AiService {
    public Map<String, String> generateDescription(String name, String context) {
        String description = "Generated description for " + name + " in context " + context + " (stub).";
        return Map.of("description", description);
    }

    public Map<String, List<String>> suggestModels(String makeName) {
        return Map.of("models", List.of(makeName + " Concept", makeName + " Touring"));
    }
}
