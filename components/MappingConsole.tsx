
import React, { useState, useMemo } from 'react';
import { MappingRule, MappingType, STANDARD_FIELDS, SAP_MATERIAL_TABLES } from '../types';

interface MappingProps {
  currentProjectId: string;
}

export const MappingConsole: React.FC<MappingProps> = ({ currentProjectId }) => {
  const [rules, setRules] = useState<MappingRule[]>([]);
  const [newRule, setNewRule] = useState<Partial<MappingRule>>({
    type: MappingType.DIRECT,
    isActive: true,
    sourceField: '',
    targetField: '',
    projectId: currentProjectId
  });

  const ALL_TARGET_FIELDS = useMemo(() => 
    SAP_MATERIAL_TABLES.flatMap(t => t.fields.map(f => ({ tech: f.technicalName, label: f.label }))), 
  []);

  const saveRule = () => {
    if (newRule.sourceField && newRule.targetField) {
      const ruleToSave = { 
        ...newRule, 
        id: Date.now().toString(),
        projectId: currentProjectId, // Siloed
        logic: '1:1 Direct' 
      } as MappingRule;
      setRules([...rules, ruleToSave]);
      setNewRule({ type: MappingType.DIRECT, isActive: true, sourceField: '', targetField: '', projectId: currentProjectId });
    }
  };

  const projectRules = useMemo(() => rules.filter(r => r.projectId === currentProjectId), [rules, currentProjectId]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6">Project Mapping Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <select 
             className="p-4 border rounded-2xl bg-slate-50 font-bold"
             value={newRule.sourceField}
             onChange={e => setNewRule({...newRule, sourceField: e.target.value})}
           >
              <option value="">Source Column</option>
              {STANDARD_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
           </select>
           <select 
             className="p-4 border rounded-2xl bg-slate-50 font-black text-[#4b778d]"
             value={newRule.targetField}
             onChange={e => setNewRule({...newRule, targetField: e.target.value})}
           >
              <option value="">SAP Target</option>
              {ALL_TARGET_FIELDS.map(f => <option key={f.tech} value={f.tech}>{f.tech} - {f.label}</option>)}
           </select>
           <button onClick={saveRule} className="bg-slate-900 text-white rounded-2xl font-black">Add Rule</button>
        </div>

        <table className="w-full text-left">
           <thead className="bg-slate-900 text-white text-[10px] uppercase font-black">
              <tr>
                <th className="px-6 py-4">Legacy Field</th>
                <th className="px-6 py-4">SAP Field</th>
                <th className="px-6 py-4">Type</th>
              </tr>
           </thead>
           <tbody>
              {projectRules.map(r => (
                <tr key={r.id} className="border-b">
                   <td className="px-6 py-4 text-sm font-bold">{r.sourceField}</td>
                   <td className="px-6 py-4 text-sm font-black text-[#4b778d]">{r.targetField}</td>
                   <td className="px-6 py-4"><span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-50 border rounded">{r.type}</span></td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};
