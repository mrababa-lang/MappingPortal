package com.slashdata.mappingportal.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "adp_master")
public class ADPMaster {
    @Id
    private String id;

    @Column(name = "adp_make_id")
    private String adpMakeId;

    @Column(name = "make_ar_desc")
    private String makeArDesc;

    @Column(name = "make_en_desc")
    private String makeEnDesc;

    @Column(name = "adp_model_id")
    private String adpModelId;

    @Column(name = "model_ar_desc")
    private String modelArDesc;

    @Column(name = "model_en_desc")
    private String modelEnDesc;

    @Column(name = "adp_type_id")
    private String adpTypeId;

    @Column(name = "type_ar_desc")
    private String typeArDesc;

    @Column(name = "type_en_desc")
    private String typeEnDesc;

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

    public String getMakeArDesc() {
        return makeArDesc;
    }

    public void setMakeArDesc(String makeArDesc) {
        this.makeArDesc = makeArDesc;
    }

    public String getMakeEnDesc() {
        return makeEnDesc;
    }

    public void setMakeEnDesc(String makeEnDesc) {
        this.makeEnDesc = makeEnDesc;
    }

    public String getAdpModelId() {
        return adpModelId;
    }

    public void setAdpModelId(String adpModelId) {
        this.adpModelId = adpModelId;
    }

    public String getModelArDesc() {
        return modelArDesc;
    }

    public void setModelArDesc(String modelArDesc) {
        this.modelArDesc = modelArDesc;
    }

    public String getModelEnDesc() {
        return modelEnDesc;
    }

    public void setModelEnDesc(String modelEnDesc) {
        this.modelEnDesc = modelEnDesc;
    }

    public String getAdpTypeId() {
        return adpTypeId;
    }

    public void setAdpTypeId(String adpTypeId) {
        this.adpTypeId = adpTypeId;
    }

    public String getTypeArDesc() {
        return typeArDesc;
    }

    public void setTypeArDesc(String typeArDesc) {
        this.typeArDesc = typeArDesc;
    }

    public String getTypeEnDesc() {
        return typeEnDesc;
    }

    public void setTypeEnDesc(String typeEnDesc) {
        this.typeEnDesc = typeEnDesc;
    }
}
