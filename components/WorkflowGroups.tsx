
import React, { useState } from 'react';
import { WorkflowGroup } from '../types';

interface GroupsProps {
  groups: WorkflowGroup[];
  setGroups: React.Dispatch<React.SetStateAction<WorkflowGroup[]>>;
  currentProjectId: string;
}

export const WorkflowGroups: React.FC<GroupsProps> = ({ groups, setGroups, currentProjectId }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  const addGroup = () => {
    if (!newGroup.name) return;
    const group: WorkflowGroup = {
      id: 'g-' + Date.now(),
      projectId: currentProjectId,
      name: newGroup.name,
      description: newGroup.description,
      memberCount: 0
    };
    setGroups([...groups, group]);
    setShowAdd(false);
    setNewGroup({ name: '', description: '' });
  };

  const removeGroup = (id: string) => {
    if (confirm('Delete this group? This may affect active workflows.')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Workflow Authority Groups</h3>
          <p className="text-sm text-slate-500 italic">Define logical groups of users for multi-stage workflow triggers.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-[#4b778d] transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus-circle"></i> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-50 transition-colors"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <i className="fas fa-users-viewfinder text-lg"></i>
                </div>
                <button onClick={() => removeGroup(group.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>

              <h4 className="text-lg font-black text-slate-800 mb-1">{group.name}</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 h-12 line-clamp-3">
                {group.description || 'No description provided for this authority group.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(group.memberCount, 3))].map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">U</div>
                  ))}
                  {group.memberCount > 3 && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600">+{group.memberCount - 3}</div>
                  )}
                </div>
                <span className="text-[10px] font-black text-[#4b778d] uppercase tracking-widest">{group.memberCount} Authorized Members</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border">
            <div className="bg-[#1d1d1b] p-8 text-white">
              <h3 className="text-xl font-black">Register Authority Group</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Workflow Provisioning</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4b778d] outline-none" 
                  placeholder="e.g. Regional Finance Leads"
                  value={newGroup.name}
                  onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mission Description</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4b778d] h-24 outline-none" 
                  placeholder="What is the scope of this group's approval authority?"
                  value={newGroup.description}
                  onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button onClick={addGroup} className="flex-[2] bg-[#4b778d] text-white py-4 rounded-2xl font-black shadow-xl">Create Group</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
