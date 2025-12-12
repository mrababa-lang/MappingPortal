package com.slashdata.mappingportal.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "adp_make_mappings")
public class ADPMakeMapping {
    @Id
    private String id;

    @Column(name = "adp_make_id", nullable = false, unique = true)
    private String adpMakeId;

    @Column(name = "make_id", nullable = false)
    private String makeId;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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
