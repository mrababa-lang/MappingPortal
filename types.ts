import React from 'react';

export interface VehicleType {
  id: string;
  name: string;
  description: string;
}

export interface Make {
  id: string;
  name: string;
  country: string;
  website?: string;
}

export interface Model {
  id: string;
  makeId: string;
  typeId: string;
  name: string;
}

export interface ADPMaster {
  id: string;
  // Make
  adpMakeId: string;
  makeArDesc: string;
  makeEnDesc: string;
  // Model
  adpModelId: string;
  modelArDesc: string;
  modelEnDesc: string;
  // Type
  adpTypeId: string;
  typeArDesc: string;
  typeEnDesc: string;
}

export interface ADPMapping {
  id: string;
  modelId: string;
  adpId: string;
  updatedAt?: string;
  updatedBy?: string; // User ID
  reviewedAt?: string;
  reviewedBy?: string; // User ID
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastActive: string;
}

export type ViewState = 'login' | 'dashboard' | 'types' | 'makes' | 'models' | 'adp-master' | 'adp-mapping' | 'mapping-review' | 'users' | 'tracking';

export interface NavItem {
  id: ViewState;
  label: string;
  icon: React.ComponentType<any>;
}