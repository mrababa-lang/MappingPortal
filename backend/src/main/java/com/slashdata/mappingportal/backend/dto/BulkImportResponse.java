package com.slashdata.mappingportal.backend.dto;

import java.util.List;

public class BulkImportResponse {
    private int successCount;
    private int errorCount;
    private List<String> errors;

    public BulkImportResponse(int successCount, int errorCount, List<String> errors) {
        this.successCount = successCount;
        this.errorCount = errorCount;
        this.errors = errors;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public int getErrorCount() {
        return errorCount;
    }

    public List<String> getErrors() {
        return errors;
    }
}
