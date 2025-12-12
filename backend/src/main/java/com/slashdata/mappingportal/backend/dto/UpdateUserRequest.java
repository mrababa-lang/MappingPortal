package com.slashdata.mappingportal.backend.dto;

import com.slashdata.mappingportal.backend.model.Role;

public class UpdateUserRequest {
    private String name;
    private Role role;
    private String status;
    private String password;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
