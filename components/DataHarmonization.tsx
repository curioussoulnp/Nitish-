
import React, { useState, useMemo, useEffect } from 'react';
import { DataBatch, ApprovalStatus } from '../types';
import { HarmonizationRule } from '../App';

interface HarmonizationProps {
  batches: DataBatch[];
  onUpdateBatch: (batch: DataBatch) => void;
  enrichRules: HarmonizationRule[];
  mergeRules: HarmonizationRule[];
  splitRules: HarmonizationRule[];
}

export const DataHarmonization: React.FC<HarmonizationProps> = ({ 
  batches, onUpdateBatch, enrichRules, mergeRules, splitRules 
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [processingType, setProcessingType] = useState<'ENRICH' | 'MERGE' | 'SPLIT' | null>(null);

  const activeBatch = useMemo(() => 
    batches.find(b => b.id === selectedId) || null, 
    [batches, selectedId]
  );

  useEffect(() => {
    const lockedInParent = batches.find(b => b.inUseBy === 'HARMONIZATION');
    if (lockedInParent && lockedInParent.id !== selectedId) {
      setSelectedId(lockedInParent.id);
    }
  }, [batches, selectedId]);

  const handleSelectBatch = (id: string) => {
    if (!id) {
      if (activeBatch) {
        onUpdateBatch({ ...activeBatch, inUseBy: null });
      }
      setSelectedId('');
      return;
    }

    const target = batches.find(b => b.id === id);
    if (target) {
      if (target.inUseBy === 'JOURNEY') {
        alert('Access Denied: This batch is currently being processed in the Data Journey module.');
        return;
      }

      if (activeBatch && activeBatch.id !== id) {
        onUpdateBatch({ ...activeBatch, inUseBy: null });
      }

      setSelectedId(id);
      onUpdateBatch({ ...target, inUseBy: 'HARMONIZATION' });
    }
  };

  const downloadExcel = () => {
    if (!activeBatch) return;
    const headers = Object.keys(activeBatch.data[0] || {}).filter(k => !k.startsWith('_') && k !== 'id');
    const rows = activeBatch.data.map(row => 
      headers.map(header => {
        const val = row[header];
        const stringVal = val === null || val === undefined ? '' : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeBatch.batchNumber}_harmonized.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runLogic = (type: 'ENRICH' | 'MERGE' | 'SPLIT') => {
    if (!activeBatch) return;
    const rulesToRun = type === 'ENRICH' ? enrichRules : type === 'MERGE' ? mergeRules : splitRules;
    
    if (rulesToRun.length === 0) {
      alert(`No ${type} rules are configured for this project. Please configure rules in the Harmonization Rules section.`);
      return;
    }

    setProcessingType(type);
    
    // Simulate complex engine execution
    setTimeout(() => {
      const updatedData = activeBatch.data.map(row => {
        if (!row.isRelevant) return row;
        
        let record = { ...row };
        let logs: string[] = [];

        rulesToRun.forEach(rule => {
          if (!rule.isActive) return;

          // Fixed Logic Parser: Use the stored 'logic' string to apply transformations
          // Format expected: IF (FIELD OP 'VALUE') THEN [ACTION] TARGET = 'RESULT'
          const conditionMatch = rule.logic.match(/IF \(([^ ]+) ([^ ]+) '([^']*)'\)/);
          const actionMatch = rule.logic.match(/THEN (?:MODIFY|ADD FIELD|ENRICH|MERGE|SPLIT) ([^ ]+) = '([^']*)'/);

          if (conditionMatch && actionMatch) {
            const [_, sField, sOp, sVal] = conditionMatch;
            const [__, tField, tVal] = actionMatch;

            let conditionMet = false;
            const actualVal = String(record[sField] || '');

            switch(sOp) {
              case '==': conditionMet = actualVal === sVal; break;
              case '!=': conditionMet = actualVal !== sVal; break;
              case '>': conditionMet = parseFloat(actualVal) > parseFloat(sVal); break;
              case '<': conditionMet = parseFloat(actualVal) < parseFloat(sVal); break;
              default: conditionMet = actualVal === sVal;
            }

            if (conditionMet) {
              record[tField] = tVal;
              logs.push(`${tField}: ${tVal}`);
            }
          }
        });

        if (logs.length > 0) {
          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newRemark = `[${now}] ${type}: ${logs.join(' | ')}. `;
          record._harmonizationRemarks = (record._harmonizationRemarks || '') + newRemark;
        }

        return record;
      });
      
      onUpdateBatch({ ...activeBatch, data: updatedData });
      setProcessingType(null);
    }, 800);
  };

  const toggleRelevancy = (rowId: string) => {
    if (!activeBatch) return;
    const updatedData = activeBatch.data.map(r => 
      r.id === rowId ? { ...r, isRelevant: !r.isRelevant } : r
    );
    onUpdateBatch({ ...activeBatch, data: updatedData });
  };

  const dataHeaders = useMemo(() => {
    if (!activeBatch || activeBatch.data.length === 0) return [];
    return Object.keys(activeBatch.data[0] || {}).filter(k => !k.startsWith('_') && k !== 'id' && k !== 'isRelevant');
  }, [activeBatch]);

  return (
    <div className="space-y-3 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tighter">Harmonization Control</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">High-Density Record Processing Engine</p>
        </div>
        {activeBatch && (
          <button 
            onClick={downloadExcel}
            className="flex items-center gap-1.5 bg-white text-slate-700 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
          >
            <i className="fas fa-file-csv text-emerald-500 text-xs"></i> Export Load
          </button>
        )}
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
         <div className="relative w-full md:w-[380px]">
            <div className="relative">
              <i className="fas fa-database absolute left-3 top-1/2 -translate-y-1/2 text-[#4b778d] text-[10px]"></i>
              <select 
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black outline-none focus:ring-1 focus:ring-[#4b778d] transition-all cursor-pointer appearance-none"
                value={selectedId}
                onChange={(e) => handleSelectBatch(e.target.value)}
              >
                <option value="">-- Active Batch Selector --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} | {b.rowCount} Recs {b.inUseBy ? `[${b.inUseBy}]` : ''}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[8px]"></i>
            </div>
         </div>

         {activeBatch && (
           <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => runLogic('ENRICH')}
                disabled={!!processingType}
                className="bg-[#4b778d] text-white px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              >
                {processingType === 'ENRICH' ? <i className="fas fa-spinner fa-spin mr-1"></i> : <i className="fas fa-wand-magic-sparkles mr-1"></i>}
                Enrich
              </button>
              <button 
                onClick={() => runLogic('MERGE')}
                disabled={!!processingType}
                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              >
                {processingType === 'MERGE' ? <i className="fas fa-spinner fa-spin mr-1"></i> : <i className="fas fa-compress mr-1"></i>}
                Merge
              </button>
              <button 
                onClick={() => runLogic('SPLIT')}
                disabled={!!processingType}
                className="bg-slate-700 text-white px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              >
                {processingType === 'SPLIT' ? <i className="fas fa-spinner fa-spin mr-1"></i> : <i className="fas fa-columns mr-1"></i>}
                Split
              </button>
           </div>
         )}
      </div>

      {!activeBatch ? (
        <div className="bg-white p-16 rounded-[30px] border-2 border-dashed border-slate-100 text-center animate-fadeIn flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-100 text-xl">
            <i className="fas fa-table-list"></i>
          </div>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">Select batch to activate grid</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-fadeIn flex flex-col h-[72vh]">
          <div className="px-5 py-2 bg-slate-50 border-b flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex flex-col border-l-2 border-[#4b778d] pl-2">
                <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Selected</span>
                <span className="text-[10px] font-black text-slate-800">{activeBatch.batchNumber}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Total</span>
                <span className="text-[10px] font-black text-[#4b778d]">{activeBatch.rowCount}</span>
              </div>
            </div>
            {processingType && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1d1d1b] rounded-md text-[8px] font-black text-white animate-pulse">
                <i className="fas fa-bolt text-blue-400"></i> {processingType} ENGINE
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-[#1d1d1b] text-white text-[8px] uppercase font-black sticky top-0 z-30">
                <tr>
                  <th className="py-2 px-1 w-10 text-center border-b border-white/5">Use</th>
                  {dataHeaders.map(h => (
                    <th key={h} className="py-2 px-2 border-b border-white/5 min-w-[110px] truncate tracking-wider">{h}</th>
                  ))}
                  <th className="py-2 px-2 w-[280px] text-[#4b778d] bg-slate-900 border-b border-white/5">Transformation History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeBatch.data.map((row, idx) => (
                  <tr 
                    key={row.id} 
                    className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'} hover:bg-blue-50/30 ${!row.isRelevant ? 'opacity-25 grayscale' : ''}`}
                  >
                    <td className="py-1 px-1 text-center border-r border-slate-50">
                      <button 
                        onClick={() => toggleRelevancy(row.id)}
                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                          row.isRelevant 
                          ? 'bg-[#4b778d] border-[#4b778d] text-white' 
                          : 'bg-white border-slate-200 text-slate-100'
                        }`}
                      >
                        <i className={`fas ${row.isRelevant ? 'fa-check' : 'fa-times'} text-[7px]`}></i>
                      </button>
                    </td>
                    {dataHeaders.map(k => (
                      <td key={k} className="py-1 px-2 text-[9px] font-bold truncate border-r border-slate-50/50 text-slate-700">
                        {row[k] || <span className="text-slate-100 font-medium">--</span>}
                      </td>
                    ))}
                    <td className="py-1 px-2 bg-slate-50/10 text-[8px] font-black leading-tight text-[#4b778d]">
                      {row._harmonizationRemarks ? (
                        <div className="flex items-center gap-1.5 bg-white/60 px-1.5 py-0.5 rounded border border-slate-200/50">
                          <i className="fas fa-terminal text-[7px] opacity-30"></i>
                          <span className="truncate" title={row._harmonizationRemarks}>
                            {row._harmonizationRemarks}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-200 font-medium italic opacity-40">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
