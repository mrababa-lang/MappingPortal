package com.slashdata.mappingportal.backend.model;

public enum Role {
    ADMIN,
    EDITOR,
    VIEWER;

    public static Role fromString(String role) {
        return Role.valueOf(role.toUpperCase());
    }
}
