
import React, { useState, useMemo } from 'react';
import { SAPTable } from '../types';
import { HarmonizationRule } from '../App';

interface ConfigProps {
  enrichRules: HarmonizationRule[];
  setEnrichRules: React.Dispatch<React.SetStateAction<HarmonizationRule[]>>;
  mergeRules: HarmonizationRule[];
  setMergeRules: React.Dispatch<React.SetStateAction<HarmonizationRule[]>>;
  splitRules: HarmonizationRule[];
  setSplitRules: React.Dispatch<React.SetStateAction<HarmonizationRule[]>>;
  sapTables: SAPTable[];
  currentProjectId: string;
}

export const HarmonizationRulesConfig: React.FC<ConfigProps> = ({ 
  enrichRules, setEnrichRules, 
  mergeRules, setMergeRules, 
  splitRules, setSplitRules,
  sapTables,
  currentProjectId
}) => {
  const [activeType, setActiveType] = useState<'ENRICH' | 'MERGE' | 'SPLIT'>('ENRICH');
  const [clauses, setClauses] = useState([{ id: '1', field: '', operator: '==', value: '', logicOperator: 'AND' }]);
  const [resultValue, setResultValue] = useState('');
  const [targetField, setTargetField] = useState('');
  const [enrichMode, setEnrichMode] = useState<'MODIFY' | 'ADD'>('MODIFY');
  const [splitMode, setSplitMode] = useState<'SIMPLE' | 'MATRIX'>('SIMPLE');
  const [matrixKeys, setMatrixKeys] = useState({ keyA: '', keyB: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const ALL_FIELDS = useMemo(() => 
    sapTables.flatMap(t => t.fields.map(f => ({
      tech: f.technicalName,
      label: f.label,
      table: t.tableName
    }))), 
  [sapTables]);

  const addClause = () => setClauses([...clauses, { id: Date.now().toString(), field: '', operator: '==', value: '', logicOperator: 'AND' }]);
  
  const generateLogicPreview = () => {
    const validClauses = clauses.filter(c => c.field);
    if (validClauses.length === 0) return "Awaiting conditions...";
    
    const condition = validClauses.map((c, i) => `${i > 0 ? c.logicOperator + ' ' : ''}(${c.field} ${c.operator} '${c.value || ''}')`).join(' ');
    
    if (activeType === 'SPLIT' && splitMode === 'MATRIX') {
      return `IF ${condition} THEN GENERATE NxM RECORDS FOR UNIQUE COMBINATIONS OF [${matrixKeys.keyA || 'KEY_A'}] x [${matrixKeys.keyB || 'KEY_B'}]`;
    }

    const actionVerb = activeType === 'ENRICH' ? (enrichMode === 'MODIFY' ? 'MODIFY' : 'ADD FIELD') : activeType;
    return `IF ${condition} THEN ${actionVerb} ${targetField || 'FIELD'} = '${resultValue || 'VALUE'}'`;
  };

  const isFormValid = () => {
    const hasValidClauses = clauses.every(c => c.field && c.operator);
    if (!hasValidClauses) return false;

    if (activeType === 'SPLIT' && splitMode === 'MATRIX') {
      return matrixKeys.keyA.length > 0 && matrixKeys.keyB.length > 0;
    }

    return targetField.length > 0 && resultValue.length > 0;
  };

  const saveRule = () => {
    if (!isFormValid()) return;

    // Added missing projectId property
    const newRule: HarmonizationRule = {
      id: Date.now().toString(),
      projectId: currentProjectId,
      type: activeType,
      enrichType: activeType === 'ENRICH' ? enrichMode : undefined,
      targetField: activeType === 'SPLIT' && splitMode === 'MATRIX' ? undefined : targetField,
      logic: generateLogicPreview(),
      isActive: true
    };

    if (activeType === 'ENRICH') setEnrichRules(prev => [...prev, newRule]);
    else if (activeType === 'MERGE') setMergeRules(prev => [...prev, newRule]);
    else if (activeType === 'SPLIT') setSplitRules(prev => [...prev, newRule]);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);

    setClauses([{ id: '1', field: '', operator: '==', value: '', logicOperator: 'AND' }]);
    setResultValue('');
    setTargetField('');
    setMatrixKeys({ keyA: '', keyB: '' });
  };

  const currentRules = activeType === 'ENRICH' ? enrichRules : activeType === 'MERGE' ? mergeRules : splitRules;

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Harmonization Strategy Designer</h3>
          <p className="text-sm text-slate-500 font-medium">Define complex structural rules for Material Master records.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           {['ENRICH', 'MERGE', 'SPLIT'].map((t) => (
             <button
              key={t}
              onClick={() => { setActiveType(t as any); setTargetField(''); }}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeType === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {t} Rules
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{activeType} Logic Builder</h4>
            {activeType === 'SPLIT' && (
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button onClick={() => setSplitMode('SIMPLE')} className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${splitMode === 'SIMPLE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Standard</button>
                <button onClick={() => setSplitMode('MATRIX')} className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${splitMode === 'MATRIX' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Matrix Multiplier</button>
              </div>
            )}
            {saveSuccess && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-bounce">Rule Saved</span>}
          </div>
          <button onClick={addClause} className="bg-slate-50 text-[10px] font-black uppercase px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all">
            <i className="fas fa-plus mr-2 text-[#4b778d]"></i> Add Clause
          </button>
        </div>

        <div className="space-y-2.5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Execution Condition (Trigger)</label>
          {clauses.map((c, i) => (
            <div key={c.id} className="flex gap-2 items-center animate-fadeIn">
              <div className="w-16 shrink-0">
                {i > 0 && (
                  <select className="w-full p-2 bg-slate-900 text-white rounded-lg text-[10px] font-black" value={c.logicOperator} onChange={(e) => setClauses(clauses.map(cl => cl.id === c.id ? {...cl, logicOperator: e.target.value as any} : cl))}>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                )}
              </div>
              <select className="flex-1 p-2.5 border rounded-xl text-xs font-bold bg-white outline-none focus:ring-1 focus:ring-[#4b778d]" value={c.field} onChange={(e) => setClauses(clauses.map(cl => cl.id === c.id ? {...cl, field: e.target.value} : cl))}>
                <option value="">-- Choose Condition Field --</option>
                {ALL_FIELDS.map(f => <option key={f.tech} value={f.tech}>{f.tech} - {f.label}</option>)}
              </select>
              <select className="w-20 p-2.5 border rounded-xl text-xs font-black bg-white" value={c.operator} onChange={(e) => setClauses(clauses.map(cl => cl.id === c.id ? {...cl, operator: e.target.value} : cl))}>
                {['==', '!=', '>', '<', 'IN'].map(op => <option key={op} value={op}>{op}</option>)}
              </select>
              <input type="text" placeholder="Compare value..." className="flex-1 p-2.5 border rounded-xl text-xs font-bold" value={c.value} onChange={(e) => setClauses(clauses.map(cl => cl.id === c.id ? {...cl, value: e.target.value} : cl))} />
              {i > 0 && (
                <button onClick={() => setClauses(clauses.filter(cl => cl.id !== c.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100">
          {activeType === 'SPLIT' && splitMode === 'MATRIX' ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                 <div className="bg-amber-100 text-amber-700 p-2 rounded-lg"><i className="fas fa-th-large text-xs"></i></div>
                 <div>
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">NxM Matrix Configuration</h5>
                    <p className="text-[10px] text-slate-500 font-medium italic">System will create new records for every unique combination of the keys below.</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Multiplier Key (N)</label>
                  <select className="w-full p-3 border rounded-xl text-xs font-black text-[#4b778d] bg-white outline-none focus:ring-2 focus:ring-[#4b778d]/20" value={matrixKeys.keyA} onChange={(e) => setMatrixKeys({...matrixKeys, keyA: e.target.value})}>
                    <option value="">-- Select Key 1 --</option>
                    {ALL_FIELDS.map(f => <option key={f.tech} value={f.tech}>{f.tech} - {f.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secondary Multiplier Key (M)</label>
                  <select className="w-full p-3 border rounded-xl text-xs font-black text-[#4b778d] bg-white outline-none focus:ring-2 focus:ring-[#4b778d]/20" value={matrixKeys.keyB} onChange={(e) => setMatrixKeys({...matrixKeys, keyB: e.target.value})}>
                    <option value="">-- Select Key 2 --</option>
                    {ALL_FIELDS.map(f => <option key={f.tech} value={f.tech}>{f.tech} - {f.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Field</label>
                  {activeType === 'ENRICH' && (
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                      <button onClick={() => setEnrichMode('MODIFY')} className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all ${enrichMode === 'MODIFY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Modify</button>
                      <button onClick={() => setEnrichMode('ADD')} className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all ${enrichMode === 'ADD' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Create</button>
                    </div>
                  )}
                </div>
                <select className="w-full p-3 border rounded-xl text-xs font-black text-[#4b778d] bg-white outline-none focus:ring-2 focus:ring-[#4b778d]/20" value={targetField} onChange={(e) => setTargetField(e.target.value)}>
                  <option value="">-- Target Data Dictionary Field --</option>
                  {ALL_FIELDS.map(f => <option key={f.tech} value={f.tech}>{f.tech} - {f.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Result Value</label>
                <input type="text" className="w-full p-3 border rounded-xl text-xs font-bold bg-emerald-50/30 text-emerald-700" placeholder="e.g. FERT or 1000" value={resultValue} onChange={(e) => setResultValue(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl font-mono text-[10px] text-blue-400 overflow-hidden shadow-inner flex items-start gap-4 border border-white/5">
          <div className="bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase font-black shrink-0">Rule Compilation Preview</div>
          <div className="pt-1 whitespace-normal break-all leading-relaxed tracking-wider">{generateLogicPreview()}</div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            onClick={saveRule} 
            disabled={!isFormValid()} 
            className="bg-[#4b778d] text-white px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#3a5d6e] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] flex items-center gap-3"
          >
            <i className="fas fa-microchip"></i> Activate {activeType} Logic
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Repository: {activeType} Strategies</h4>
           <span className="px-2 py-1 bg-white border rounded text-[9px] font-black text-slate-500 uppercase">{currentRules.length} Strategies Active</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50">
              {currentRules.map((rule, idx) => (
                <tr key={rule.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm ${
                        rule.logic.includes('NxM') ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <i className={`fas ${rule.logic.includes('NxM') ? 'fa-th' : 'fa-code'}`}></i>
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 font-mono leading-relaxed">{rule.logic}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => {
                      if (activeType === 'ENRICH') setEnrichRules(prev => prev.filter(r => r.id !== rule.id));
                      if (activeType === 'MERGE') setMergeRules(prev => prev.filter(r => r.id !== rule.id));
                      if (activeType === 'SPLIT') setSplitRules(prev => prev.filter(r => r.id !== rule.id));
                    }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-slate-100 rounded-lg"><i className="fas fa-trash-alt text-xs"></i></button>
                  </td>
                </tr>
              ))}
              {currentRules.length === 0 && (
                <tr>
                  <td className="px-6 py-16 text-center">
                    <p className="text-slate-300 font-bold italic text-xs">No active {activeType} strategies detected.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
