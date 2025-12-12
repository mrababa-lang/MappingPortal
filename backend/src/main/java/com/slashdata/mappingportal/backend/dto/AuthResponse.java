package com.slashdata.mappingportal.backend.dto;

public class AuthResponse {
    private String token;
    private Object user;

    public AuthResponse(String token, Object user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public Object getUser() {
        return user;
    }
}
