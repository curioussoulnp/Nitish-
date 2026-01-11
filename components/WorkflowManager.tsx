
import React, { useState } from 'react';
import { WorkflowRule, WorkflowCategory, WorkflowGroup } from '../types';

interface WorkflowProps {
  groups: WorkflowGroup[];
  currentProjectId: string;
}

export const WorkflowManager: React.FC<WorkflowProps> = ({ groups, currentProjectId }) => {
  const [rules, setRules] = useState<WorkflowRule[]>([
    {
      id: 'wf-1',
      projectId: currentProjectId,
      category: WorkflowCategory.SUBMISSION,
      materialTypes: 'FERT, HALB',
      plants: '1000, 1100',
      description: 'Initial Submission - European Production',
      l1GroupId: 'g-1',
      l2GroupId: 'g-2',
      l3GroupId: 'g-admin',
      isActive: true
    },
    {
      id: 'wf-2',
      projectId: currentProjectId,
      category: WorkflowCategory.TRANSFORMATION,
      materialTypes: '*',
      plants: '2000, 2100',
      description: 'Transformation Approval - North America',
      l1GroupId: 'g-2',
      l2GroupId: 'g-2',
      l3GroupId: 'g-admin',
      isActive: true
    }
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState<Partial<WorkflowRule>>({
    category: WorkflowCategory.SUBMISSION,
    materialTypes: '*',
    plants: '*',
    isActive: true,
    l1GroupId: '',
    l2GroupId: '',
    l3GroupId: ''
  });

  const saveRule = () => {
    if (!newRule.description || !newRule.l1GroupId) return;
    const rule: WorkflowRule = {
      ...newRule as WorkflowRule,
      id: 'wf-' + Date.now(),
      projectId: currentProjectId
    };
    setRules([...rules, rule]);
    setShowAdd(false);
    setNewRule({ 
      category: WorkflowCategory.SUBMISSION, 
      materialTypes: '*', 
      plants: '*', 
      isActive: true,
      l1GroupId: '',
      l2GroupId: '',
      l3GroupId: ''
    });
  };

  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || 'Not Assigned';

  const categories = [
    { type: WorkflowCategory.SUBMISSION, color: 'blue', icon: 'fa-file-import' },
    { type: WorkflowCategory.TRANSFORMATION, color: 'emerald', icon: 'fa-wand-magic-sparkles' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Group-Based Workflow Orchestrator</h3>
          <p className="text-sm text-slate-500 italic">Establish multi-stage approval routes assigned to Workflow Authority Groups.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-[#4b778d] transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus-circle"></i> Create Routing Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.type} className={`bg-white rounded-3xl p-6 border-2 border-dashed ${cat.type === WorkflowCategory.SUBMISSION ? 'border-blue-100' : 'border-emerald-100'} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${cat.type === WorkflowCategory.SUBMISSION ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                <i className={`fas ${cat.icon} text-xl`}></i>
              </div>
              <h4 className="font-black text-slate-800 text-lg">{cat.type}</h4>
            </div>
            
            <div className="space-y-3">
              {rules.filter(r => r.category === cat.type).map(rule => (
                <div key={rule.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold text-slate-700 text-sm">{rule.description}</h5>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-400 hover:text-red-600"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white border border-slate-50 p-2 rounded-xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Mat. Type: {rule.materialTypes}</p>
                    </div>
                    <div className="bg-white border border-slate-50 p-2 rounded-xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Plant(s): {rule.plants}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 justify-between">
                    {[rule.l1GroupId, rule.l2GroupId, rule.l3GroupId].map((gid, i) => (
                      <React.Fragment key={i}>
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white mb-1 ${cat.type === WorkflowCategory.SUBMISSION ? 'bg-blue-400' : 'bg-emerald-400'}`}>L{i+1}</div>
                          <span className="text-[9px] font-black text-[#4b778d] truncate w-full text-center uppercase" title={getGroupName(gid)}>
                            {getGroupName(gid)}
                          </span>
                        </div>
                        {i < 2 && <div className="h-px bg-slate-200 flex-1 mb-4"></div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border">
            <div className="bg-[#1d1d1b] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">Group-Based Routing Designer</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workflow Category</label>
                  <select className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-black outline-none" onChange={e => setNewRule({...newRule, category: e.target.value as WorkflowCategory})} value={newRule.category}>
                    <option value={WorkflowCategory.SUBMISSION}>Submission Workflow</option>
                    <option value={WorkflowCategory.TRANSFORMATION}>Transformation Workflow</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rule Description</label>
                  <input type="text" className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold outline-none" onChange={e => setNewRule({...newRule, description: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-[11px] font-black text-[#4b778d] uppercase tracking-widest">Authority Group Assignment</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { lvl: 'L1', label: 'Functional Validation Group', field: 'l1GroupId' },
                    { lvl: 'L2', label: 'Regional Stewardship Group', field: 'l2GroupId' },
                    { lvl: 'L3', label: 'Global Compliance Group', field: 'l3GroupId' }
                  ].map((auth) => (
                    <div key={auth.lvl} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">{auth.lvl}</div>
                      <div className="flex-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">{auth.label}</label>
                        <select 
                          className="w-full bg-transparent text-sm font-black outline-none text-slate-700"
                          onChange={e => setNewRule({...newRule, [auth.field]: e.target.value})}
                          value={(newRule as any)[auth.field]}
                        >
                          <option value="">-- Select Authority Group --</option>
                          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={saveRule}
                disabled={!newRule.description || !newRule.l1GroupId}
                className="w-full bg-[#4b778d] text-white py-4 rounded-2xl font-black shadow-xl"
              >
                Activate Routing Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
