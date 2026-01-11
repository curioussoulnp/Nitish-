
import React, { useState, useMemo } from 'react';
import { Project, User, WorkflowGroup, UserRole } from '../types';

interface ControlTowerProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  groups: WorkflowGroup[];
}

export const ProjectControlTower: React.FC<ControlTowerProps> = ({ 
  projects, setProjects, users, setUsers, groups 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'access-matrix' | 'group-mapping'>('projects');
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', code: '', description: '' });

  const handleAddProject = () => {
    if (!newProject.name || !newProject.code) return;
    const project: Project = {
      id: 'P' + Date.now(),
      name: newProject.name,
      code: newProject.code.toUpperCase(),
      description: newProject.description
    };
    setProjects([...projects, project]);
    setShowAddProject(false);
    setNewProject({ name: '', code: '', description: '' });
  };

  const toggleProjectAccess = (userId: string, projectId: string) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        const hasAccess = user.assignedProjects.includes(projectId);
        return {
          ...user,
          assignedProjects: hasAccess 
            ? user.assignedProjects.filter(id => id !== projectId)
            : [...user.assignedProjects, projectId]
        };
      }
      return user;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Project Control Tower</h3>
          <p className="text-sm text-slate-500 font-medium">Global governance for multi-project isolation and user provisioning.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border shadow-sm">
          {[
            { id: 'projects', label: 'Projects', icon: 'fa-diagram-project' },
            { id: 'access-matrix', label: 'Access Matrix', icon: 'fa-table-cells' },
            { id: 'group-mapping', label: 'Group Mapping', icon: 'fa-users-gear' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeSubTab === tab.id ? 'bg-[#4b778d] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {projects.map(project => (
            <div key={project.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4b778d]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#4b778d]/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-mono text-[10px] font-black uppercase tracking-tighter">
                    {project.code}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-slate-200 hover:text-[#4b778d] transition-colors"><i className="fas fa-edit text-xs"></i></button>
                    <button className="text-slate-200 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt text-xs"></i></button>
                  </div>
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-2 truncate">{project.name}</h4>
                <p className="text-xs text-slate-400 font-medium line-clamp-2 h-8 mb-6">{project.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-[#4b778d] uppercase tracking-widest">
                    {users.filter(u => u.assignedProjects.includes(project.id)).length} Users Enrolled
                  </span>
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-300">U</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setShowAddProject(true)}
            className="border-2 border-dashed border-slate-200 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 hover:border-[#4b778d] hover:bg-[#4b778d]/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#4b778d] group-hover:text-white transition-all">
              <i className="fas fa-plus"></i>
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-[#4b778d]">Provision New Project</span>
          </button>
        </div>
      )}

      {activeSubTab === 'access-matrix' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
          <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
             <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Global Access Matrix</h4>
             <p className="text-[10px] text-slate-400 font-medium">Cross-reference users with designated projects for data isolation.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 border-r">User Identity</th>
                  {projects.map(p => (
                    <th key={p.id} className="px-6 py-5 text-center text-[10px] font-black text-slate-700 uppercase tracking-tighter border-r last:border-r-0 min-w-[150px]">
                      {p.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 sticky left-0 bg-white z-10 border-r shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{user.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    {projects.map(p => {
                      const hasAccess = user.assignedProjects.includes(p.id);
                      return (
                        <td key={p.id} className="px-6 py-4 text-center border-r last:border-r-0">
                          <button 
                            onClick={() => toggleProjectAccess(user.id, p.id)}
                            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center mx-auto border-2 ${
                              hasAccess 
                                ? 'bg-[#4b778d] border-[#4b778d] text-white shadow-md' 
                                : 'bg-white border-slate-100 text-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <i className={`fas ${hasAccess ? 'fa-check' : 'fa-plus'} text-xs`}></i>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'group-mapping' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
           <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Authority Groups</h4>
              <div className="space-y-2">
                 {groups.map(group => (
                   <div key={group.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-[#4b778d] transition-all cursor-pointer">
                      <div>
                        <p className="text-xs font-black text-slate-800">{group.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{projects.find(p => p.id === group.projectId)?.code}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-[#4b778d]">{group.memberCount} Mbrs</span>
                   </div>
                 ))}
              </div>
           </div>
           <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">User Assignments Matrix</h4>
                 <button className="text-[10px] font-black text-[#4b778d] uppercase tracking-widest hover:underline">Bulk Sync</button>
              </div>
              <div className="space-y-3">
                 {users.map(user => (
                   <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl border hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-[#4b778d]">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{user.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                        {groups.map(g => (
                          <button
                            key={g.id}
                            className={`px-2 py-1 rounded text-[8px] font-black uppercase border transition-all ${
                              user.assignedGroups.includes(g.id)
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {g.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {showAddProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border">
            <div className="bg-[#1d1d1b] p-8 text-white">
              <h3 className="text-xl font-black">Register Ecosystem Project</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global Workspace Provisioning</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Internal Project Code</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#4b778d] outline-none uppercase" 
                  placeholder="e.g. S4_EUR_W1"
                  value={newProject.code}
                  onChange={e => setNewProject({...newProject, code: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Formal Name</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4b778d] outline-none" 
                  placeholder="e.g. Europe Wave 1 SAP Rollout"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Scope Description</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border rounded-2xl text-sm font-medium h-24 outline-none" 
                  placeholder="Brief summary of the data object scope..."
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddProject(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button onClick={handleAddProject} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#4b778d] transition-all">Provision Project</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
