
import React, { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MappingConsole } from './components/MappingConsole';
import { DataUploads } from './components/DataUploads';
import { AuditLogs } from './components/AuditLogs';
import { MaterialFieldDictionary } from './components/MaterialFieldDictionary';
import { UserManagement } from './components/UserManagement';
import { WorkflowManager } from './components/WorkflowManager';
import { WorkflowGroups } from './components/WorkflowGroups';
import { TargetLoVManager } from './components/TargetLoVManager';
import { DataHarmonization } from './components/DataHarmonization';
import { HarmonizationRulesConfig } from './components/HarmonizationRulesConfig';
import { ProjectControlTower } from './components/ProjectControlTower';
import { User, UserRole, DataBatch, ApprovalStatus, SAP_MATERIAL_TABLES, SAPTable, WorkflowGroup, Project } from './types';

export interface HarmonizationRule {
  id: string;
  projectId: string;
  type: 'ENRICH' | 'MERGE' | 'SPLIT';
  enrichType?: 'MODIFY' | 'ADD';
  targetField?: string;
  logic: string;
  isActive: boolean;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'admin-1',
    name: 'Protiviti Admin',
    email: 'admin@protiviti.com',
    role: UserRole.ADMIN,
    status: 'Active',
    lastLogin: new Date().toLocaleString(),
    assignedGroups: ['g-admin'],
    assignedProjects: ['P001', 'P002'],
    assignedWorkflows: ['L1', 'L2', 'L3']
  });

  const [projects, setProjects] = useState<Project[]>([
    { id: 'P001', code: 'PRJ_EU_25', name: 'Europe S/4HANA Transformation', description: 'Global rollout Wave 1' },
    { id: 'P002', code: 'PRJ_NA_26', name: 'North America Data Cleansing', description: 'Global rollout Wave 2' }
  ]);

  const [activeProject, setActiveProject] = useState<Project | null>(projects[0]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedObject, setSelectedObject] = useState('material');

  const [sapTables, setSapTables] = useState<SAPTable[]>(SAP_MATERIAL_TABLES);

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john.doe@protiviti.com', role: UserRole.ADMIN, status: 'Active', lastLogin: '2025-05-20 09:15', assignedGroups: ['g-admin'], assignedWorkflows: [], assignedProjects: ['P001'] },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@partner.com', role: UserRole.STEWARD, status: 'Active', lastLogin: '2025-05-19 14:22', assignedGroups: ['g-1', 'g-2'], assignedWorkflows: [], assignedProjects: ['P001', 'P002'] },
  ]);

  const [groups, setGroups] = useState<WorkflowGroup[]>([
    { id: 'g-1', projectId: 'P001', name: 'Functional Leads - EU', description: 'Europe Project functional group', memberCount: 5 },
    { id: 'g-2', projectId: 'P002', name: 'NA Migration Team', description: 'North America Migration group', memberCount: 8 }
  ]);

  const [enrichRules, setEnrichRules] = useState<HarmonizationRule[]>([]);
  const [mergeRules, setMergeRules] = useState<HarmonizationRule[]>([]);
  const [splitRules, setSplitRules] = useState<HarmonizationRule[]>([]);

  const [batches, setBatches] = useState<DataBatch[]>([
    {
      id: 'B001',
      projectId: 'P001',
      batchNumber: 'M202502200001',
      description: 'Legacy Plant 1000 Migration',
      objectType: 'Material Master',
      status: ApprovalStatus.SUBMITTED,
      version: 1,
      uploadedBy: 'SysAdmin',
      uploadDate: '2025-02-20 10:00',
      rowCount: 3,
      data: [{ id: '1', "Old Mat No": '100-200', "Site": '1000', isRelevant: true }],
      isRelevant: true,
      inUseBy: null
    }
  ]);

  const projectBatches = useMemo(() => batches.filter(b => b.projectId === activeProject?.id), [batches, activeProject]);
  const projectGroups = useMemo(() => groups.filter(g => g.projectId === activeProject?.id), [groups, activeProject]);
  const projectEnrichRules = useMemo(() => enrichRules.filter(r => r.projectId === activeProject?.id), [enrichRules, activeProject]);
  const projectMergeRules = useMemo(() => mergeRules.filter(r => r.projectId === activeProject?.id), [mergeRules, activeProject]);
  const projectSplitRules = useMemo(() => splitRules.filter(r => r.projectId === activeProject?.id), [splitRules, activeProject]);

  const updateBatch = (updatedBatch: DataBatch) => {
    setBatches(prev => prev.map(b => b.id === updatedBatch.id ? updatedBatch : b));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const renderContent = () => {
    if (selectedObject !== 'material' && !['dashboard', 'logs', 'users', 'groups', 'tower'].includes(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100 animate-fadeIn">
          <i className="fas fa-layer-group text-6xl mb-4 text-slate-200"></i>
          <h3 className="text-xl font-bold text-slate-800 capitalize">{selectedObject.replace('-', ' ')} Implementation</h3>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tower': return <ProjectControlTower projects={projects} setProjects={setProjects} users={users} setUsers={setUsers} groups={groups} />;
      case 'uploads': return <DataUploads batches={projectBatches} onUpdateBatch={updateBatch} onSetBatches={setBatches} currentProjectId={activeProject?.id || ''} />;
      case 'harmonization':
        return (
          <DataHarmonization 
            batches={projectBatches} 
            onUpdateBatch={updateBatch} 
            enrichRules={projectEnrichRules}
            mergeRules={projectMergeRules}
            splitRules={projectSplitRules}
          />
        );
      case 'harmonization_rules':
        return (
          <HarmonizationRulesConfig 
            enrichRules={enrichRules} setEnrichRules={setEnrichRules}
            mergeRules={mergeRules} setMergeRules={setMergeRules}
            splitRules={splitRules} setSplitRules={setSplitRules}
            sapTables={sapTables}
            currentProjectId={activeProject?.id || ''}
          />
        );
      case 'mapping': return <MappingConsole currentProjectId={activeProject?.id || ''} />;
      case 'lovs': return <TargetLoVManager />;
      case 'fields': return <MaterialFieldDictionary tables={sapTables} setTables={setSapTables} />;
      case 'users': return <UserManagement groups={projectGroups} currentProjectId={activeProject?.id || ''} users={users} setUsers={setUsers} />;
      case 'groups': return <WorkflowGroups groups={groups} setGroups={setGroups} currentProjectId={activeProject?.id || ''} />;
      case 'workflow': return <WorkflowManager groups={projectGroups} currentProjectId={activeProject?.id || ''} />;
      case 'logs': return <AuditLogs currentProjectId={activeProject?.id || ''} />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-slate-400 uppercase tracking-widest">
        Authentication Disabled for Development
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={setActiveTab} 
      selectedObject={selectedObject} setSelectedObject={setSelectedObject}
      user={currentUser} activeProject={activeProject} onLogout={handleLogout}
      projects={projects} setActiveProject={setActiveProject}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
