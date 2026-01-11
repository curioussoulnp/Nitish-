
export enum UserRole {
  ADMIN = 'Administrator',
  STEWARD = 'Data Steward',
  LEAD = 'Functional Lead',
  VIEWER = 'Viewer'
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
}

export enum WorkflowCategory {
  SUBMISSION = 'Submission Workflow',
  TRANSFORMATION = 'Transformation Workflow'
}

export interface WorkflowGroup {
  id: string;
  projectId: string; // Project specific
  name: string;
  description: string;
  memberCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  assignedGroups: string[]; 
  assignedProjects: string[]; // Projects this user can access
  assignedWorkflows: string[];
}

export enum ApprovalStatus {
  DRAFT = 'Draft',
  META_VALIDATED = 'Validated (Metadata)',
  SUBMITTED = 'Submitted',
  TRANSFORMED = 'Transformed',
  DATA_VALIDATED = 'Validated (Data)',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum MappingType {
  DIRECT = 'Direct',
  CONDITIONAL = 'Conditional',
  VALUE_MAP = 'Value Mapping'
}

export interface SAPField {
  label: string;
  technicalName: string;
  dataType: string;
  length: number;
  description?: string;
}

export interface SAPTable {
  tableName: string;
  description: string;
  fields: SAPField[];
}

export interface MappingRule {
  id: string;
  projectId: string; // Project specific
  sourceField: string;
  targetField: string;
  type: MappingType;
  logic: string;
  isActive: boolean;
}

export interface WorkflowRule {
  id: string;
  projectId: string; // Project specific
  category: WorkflowCategory;
  materialTypes: string;
  plants: string;
  description: string;
  l1GroupId: string;
  l2GroupId: string;
  l3GroupId: string;
  isActive: boolean;
}

export interface MaterialMasterRecord {
  id: string;
  isRelevant: boolean;
  _isAdded?: boolean;
  _isDeleted?: boolean;
  _isEnriched?: boolean;
  _enrichedFields?: string[];
  _harmonizationRemarks?: string;
  [key: string]: any;
}

export interface DataBatch {
  id: string;
  projectId: string; // Project specific
  batchNumber: string;
  description: string;
  objectType: 'Material Master' | 'Vendor Master' | 'Customer Master' | 'BOM';
  status: ApprovalStatus;
  version: number;
  uploadedBy: string;
  uploadDate: string;
  rowCount: number;
  data: MaterialMasterRecord[];
  isRelevant: boolean;
  metadataMap?: Record<string, string>;
  inUseBy?: 'JOURNEY' | 'HARMONIZATION' | null;
  // Added to fix property error in DataUploads.tsx
  _harmonizationRemarks?: string;
}

// Added ChangeLog interface to fix export error in AuditLogs.tsx
export interface ChangeLog {
  id: string;
  projectId: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export const SAP_MATERIAL_TABLES: SAPTable[] = [
  {
    tableName: 'MARA',
    description: 'General Material Data',
    fields: [
      { label: 'Material Number', technicalName: 'MATNR', dataType: 'CHAR', length: 18 },
      { label: 'Created On', technicalName: 'ERSDA', dataType: 'DATS', length: 8 },
      { label: 'Created By', technicalName: 'ERNAM', dataType: 'CHAR', length: 12 },
      { label: 'Last Change', technicalName: 'LAEDA', dataType: 'DATS', length: 8 },
      { label: 'Deletion Indicator', technicalName: 'LVORM', dataType: 'CHAR', length: 1 },
      { label: 'Material Type', technicalName: 'MTART', dataType: 'CHAR', length: 4 },
      { label: 'Industry Sector', technicalName: 'MBRSH', dataType: 'CHAR', length: 1 },
      { label: 'Material Group', technicalName: 'MATKL', dataType: 'CHAR', length: 9 },
      { label: 'Old Material Number', technicalName: 'BISMT', dataType: 'CHAR', length: 18 },
      { label: 'Base Unit of Measure', technicalName: 'MEINS', dataType: 'UNIT', length: 3 },
      { label: 'Division', technicalName: 'SPART', dataType: 'CHAR', length: 2 },
      { label: 'Gross Weight', technicalName: 'BRGEW', dataType: 'QUAN', length: 13 },
      { label: 'Net Weight', technicalName: 'NTGEW', dataType: 'QUAN', length: 13 },
      { label: 'Weight Unit', technicalName: 'GEWEI', dataType: 'UNIT', length: 3 },
      { label: 'Volume', technicalName: 'VOLUM', dataType: 'QUAN', length: 13 },
      { label: 'Volume Unit', technicalName: 'VOLEH', dataType: 'UNIT', length: 3 },
      { label: 'Cross-Plant Status', technicalName: 'MSTAE', dataType: 'CHAR', length: 2 },
      { label: 'Lab/Office', technicalName: 'LABOR', dataType: 'CHAR', length: 3 },
      { label: 'EAN/UPC Number', technicalName: 'EAN11', dataType: 'CHAR', length: 18 }
    ]
  },
  {
    tableName: 'MARC',
    description: 'Plant Data for Material',
    fields: [
      { label: 'Plant', technicalName: 'WERKS', dataType: 'CHAR', length: 4 },
      { label: 'Purchasing Group', technicalName: 'EKGRP', dataType: 'CHAR', length: 3 },
      { label: 'MRP Type', technicalName: 'DISMM', dataType: 'CHAR', length: 2 },
      { label: 'MRP Controller', technicalName: 'DISPO', dataType: 'CHAR', length: 3 },
      { label: 'Loading Group', technicalName: 'LADGR', dataType: 'CHAR', length: 4 },
      { label: 'Profit Center', technicalName: 'PRCTR', dataType: 'CHAR', length: 10 },
      { label: 'Batch Management', technicalName: 'XCHPF', dataType: 'CHAR', length: 1 }
    ]
  },
  {
    tableName: 'MARD',
    description: 'Storage Location Data',
    fields: [
      { label: 'Plant', technicalName: 'WERKS', dataType: 'CHAR', length: 4 },
      { label: 'Storage Location', technicalName: 'LGORT', dataType: 'CHAR', length: 4 },
      { label: 'Storage Bin', technicalName: 'LGPBE', dataType: 'CHAR', length: 10 },
      { label: 'Total Stock', technicalName: 'LABST', dataType: 'QUAN', length: 13 }
    ]
  }
];

export const STANDARD_FIELDS = SAP_MATERIAL_TABLES.flatMap(t => t.fields.map(f => f.label));
export const TECHNICAL_FIELDS = SAP_MATERIAL_TABLES.flatMap(t => t.fields.map(f => f.technicalName));