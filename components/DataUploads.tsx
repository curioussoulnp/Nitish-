
import React, { useState, useRef, useMemo } from 'react';
import { DataBatch, ApprovalStatus, SAP_MATERIAL_TABLES, SAPField, TECHNICAL_FIELDS } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface UploadsProps {
  batches: DataBatch[];
  onUpdateBatch: (batch: DataBatch) => void;
  onSetBatches: React.Dispatch<React.SetStateAction<DataBatch[]>>;
  currentProjectId: string;
}

export const DataUploads: React.FC<UploadsProps> = ({ batches, onUpdateBatch, onSetBatches, currentProjectId }) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [description, setDescription] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectedBatch = useMemo(() => 
    batches.find(b => b.id === selectedBatchId) || null,
    [batches, selectedBatchId]
  );

  const batchStats = useMemo(() => {
    if (!selectedBatch) return null;
    const rows = selectedBatch.data;
    const totalCells = rows.length * Object.keys(rows[0] || {}).length;
    let emptyCells = 0;
    let duplicates = 0;
    const seenRows = new Set();

    rows.forEach(row => {
      const rowString = JSON.stringify(row);
      if (seenRows.has(rowString)) duplicates++;
      seenRows.add(rowString);
      Object.values(row).forEach(val => {
        if (val === null || val === undefined || val === '') emptyCells++;
      });
    });

    const completeness = Math.round(((totalCells - emptyCells) / totalCells) * 100);
    
    return {
      completeness,
      duplicates,
      totalRows: rows.length,
      qualityScore: Math.max(0, completeness - (duplicates / rows.length * 100))
    };
  }, [selectedBatch]);

  const handleOpenBatch = (id: string) => {
    const batch = batches.find(b => b.id === id);
    if (batch?.inUseBy === 'HARMONIZATION') {
      alert('This batch is currently being processed in Data Harmonization and is locked.');
      return;
    }
    if (batch) onUpdateBatch({ ...batch, inUseBy: 'JOURNEY' });
    setSelectedBatchId(id);
  };

  const handleCloseBatch = () => {
    if (selectedBatch) onUpdateBatch({ ...selectedBatch, inUseBy: null });
    setSelectedBatchId(null);
  };

  const downloadExcel = () => {
    if (!selectedBatch) return;
    const headers = Object.keys(selectedBatch.data[0] || {}).filter(k => !k.startsWith('_') && k !== 'id');
    const rows = selectedBatch.data.map(row => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedBatch.batchNumber}_journey_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runMetadataValidation = () => {
    if (!selectedBatch) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      const newMetadataMap: Record<string, string> = {};
      const allFields = SAP_MATERIAL_TABLES.flatMap(t => t.fields);
      const headers = Object.keys(selectedBatch.data[0] || {}).filter(k => !k.startsWith('_') && k !== 'id' && k !== 'isRelevant');
      
      let validationNotes = "Pre-flight Validation Successful.";
      let errorsFound = false;

      headers.forEach(header => {
        const match = allFields.find(f => 
          f.label.toLowerCase().includes(header.toLowerCase()) || 
          header.toLowerCase().includes(f.label.toLowerCase()) ||
          f.technicalName.toLowerCase() === header.toLowerCase()
        );
        if (match) {
          newMetadataMap[header] = match.technicalName;
          const maxLengthInBatch = Math.max(...selectedBatch.data.map(r => String(r[header] || '').length));
          if (maxLengthInBatch > match.length) {
            validationNotes = `Warning: Field ${header} exceeds SAP length ${match.length}.`;
            errorsFound = true;
          }
        }
      });

      onUpdateBatch({ 
        ...selectedBatch, 
        status: ApprovalStatus.META_VALIDATED,
        metadataMap: newMetadataMap,
        _harmonizationRemarks: validationNotes
      });
      setIsProcessing(false);
      if (errorsFound) alert(validationNotes);
    }, 1500);
  };

  const runSubmission = () => {
    if (!selectedBatch) return;
    onUpdateBatch({ ...selectedBatch, status: ApprovalStatus.SUBMITTED });
  };

  const runTransformation = () => {
    if (!selectedBatch) return;
    setIsProcessing(true);
    setTimeout(() => {
      const transformedData = selectedBatch.data.map(row => {
        const newRow = { ...row };
        if (row._isDeleted) return row;
        return { ...newRow, _isTransformed: true };
      });
      onUpdateBatch({ ...selectedBatch, data: transformedData, status: ApprovalStatus.TRANSFORMED });
      setIsProcessing(false);
    }, 1500);
  };

  const runDataValidation = () => {
    if (!selectedBatch) return;
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateBatch({ ...selectedBatch, status: ApprovalStatus.DATA_VALIDATED });
      setIsProcessing(false);
    }, 1000);
  };

  const runApproval = (level: number) => {
    if (!selectedBatch) return;
    if (level === 3) {
      onUpdateBatch({ ...selectedBatch, status: ApprovalStatus.APPROVED });
    } else {
      alert(`Level ${level} Approved successfully.`);
    }
  };

  const confirmUpload = () => {
    if (!description.trim() || !pendingFile) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result?.toString() || "";
      const lines = content.split('\n').filter(l => l.trim());
      if (lines.length === 0) {
        alert("File is empty");
        setIsProcessing(false);
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map((l, i) => {
        const values = l.split(',');
        const obj: any = { id: (i+1).toString(), isRelevant: true };
        headers.forEach((h, idx) => obj[h] = values[idx]?.trim());
        return obj;
      });

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateString = `${year}${month}${day}`;
      const prefix = `M${dateString}`;

      const todaysProjectBatches = batches.filter(b => 
        b.projectId === currentProjectId && 
        b.batchNumber.startsWith(prefix)
      );

      let nextSeries = 1;
      if (todaysProjectBatches.length > 0) {
        const seriesNumbers = todaysProjectBatches.map(b => {
          const seriesPart = b.batchNumber.replace(prefix, '');
          return parseInt(seriesPart, 10) || 0;
        });
        nextSeries = Math.max(...seriesNumbers) + 1;
      }

      const formattedSeries = String(nextSeries).padStart(4, '0');
      const finalBatchNumber = `${prefix}${formattedSeries}`;
      const uniqueInternalId = `BATCH_${now.getTime()}`;

      const newBatch: DataBatch = {
        id: uniqueInternalId,
        projectId: currentProjectId,
        batchNumber: finalBatchNumber,
        description,
        objectType: 'Material Master',
        status: ApprovalStatus.DRAFT,
        version: 1,
        uploadedBy: 'Active User',
        uploadDate: now.toLocaleString(),
        rowCount: data.length,
        data,
        isRelevant: true,
        inUseBy: null,
        metadataMap: {}
      };
      
      onSetBatches(prev => [newBatch, ...prev]);
      setIsProcessing(false);
      setShowPrompt(false);
      setPendingFile(null);
      setDescription('');
    };
    reader.readAsText(pendingFile);
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case ApprovalStatus.SUBMITTED: return 'text-green-600 bg-green-50 border-green-100';
      case ApprovalStatus.TRANSFORMED: return 'text-blue-600 bg-blue-50 border-blue-100';
      case ApprovalStatus.DRAFT: return 'text-amber-600 bg-amber-50 border-amber-100';
      case ApprovalStatus.DATA_VALIDATED: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getActionForStatus = () => {
    if (!selectedBatch) return null;
    switch (selectedBatch.status) {
      case ApprovalStatus.DRAFT:
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAnalytics(true)} 
              className="bg-white text-slate-800 border-2 border-slate-100 px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <i className="fas fa-chart-pie text-indigo-500"></i> Analytics Insight
            </button>
            <button 
              onClick={runMetadataValidation} 
              className="bg-[#4b778d] text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-[#4b778d]/20"
            >
              <i className="fas fa-shield-check"></i> Validate Metadata
            </button>
          </div>
        );
      case ApprovalStatus.META_VALIDATED:
        return <button onClick={runSubmission} className="bg-green-600 text-white px-6 py-2 rounded-xl text-xs font-black">Submit for Approval</button>;
      case ApprovalStatus.SUBMITTED:
        return <button onClick={runTransformation} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black">Transform Data</button>;
      case ApprovalStatus.TRANSFORMED:
        return <button onClick={runDataValidation} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black">Run Data Validation</button>;
      case ApprovalStatus.DATA_VALIDATED:
        return (
          <div className="flex gap-2">
            <button onClick={() => runApproval(1)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black">Approve L1</button>
            <button onClick={() => runApproval(2)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">Approve L2</button>
            <button onClick={() => runApproval(3)} className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black">Final Approval L3</button>
          </div>
        );
      default:
        return <span className="text-emerald-600 font-black text-xs uppercase tracking-widest"><i className="fas fa-check-double mr-2"></i> Migration Ready</span>;
    }
  };

  const workflowSteps = [
    ApprovalStatus.DRAFT, 
    ApprovalStatus.META_VALIDATED, 
    ApprovalStatus.SUBMITTED, 
    ApprovalStatus.TRANSFORMED,
    ApprovalStatus.DATA_VALIDATED,
    ApprovalStatus.APPROVED
  ];

  return (
    <div className="space-y-6">
      {selectedBatch ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={handleCloseBatch} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                  <i className="fas fa-arrow-left text-slate-400"></i>
                </button>
                <div>
                  <h4 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                    {selectedBatch.batchNumber}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getStatusColor(selectedBatch.status)}`}>
                      {selectedBatch.status}
                    </span>
                  </h4>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={downloadExcel}
                  className="bg-white text-slate-600 border px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-50"
                >
                  <i className="fas fa-download text-[#4b778d]"></i> Download Real-time
                </button>
                {isProcessing ? (
                   <div className="flex items-center gap-3 px-6 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-400">
                     <i className="fas fa-spinner fa-spin"></i> Processing Stage...
                   </div>
                ) : getActionForStatus()}
              </div>
            </div>

            <div className="relative pt-4 pb-2 px-10">
              <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
              <div className="flex justify-between relative z-10">
                {workflowSteps.map((s, i) => {
                  const isActive = workflowSteps.indexOf(selectedBatch.status) >= i;
                  return (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${
                        isActive ? 'bg-[#4b778d] border-blue-100 text-white' : 'bg-white border-slate-50 text-slate-300'
                      }`}>
                        {isActive && workflowSteps.indexOf(selectedBatch.status) > i ? <i className="fas fa-check text-[10px]"></i> : <span className="text-[10px] font-black">{i+1}</span>}
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-slate-800' : 'text-slate-300'}`}>{s.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
             <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Technical Mapping Explorer</span>
                <span className="text-[9px] font-bold text-slate-400">Verified Rows: {selectedBatch.data.length}</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-[#1d1d1b] text-white text-[10px] uppercase font-black">
                      <tr>
                        {Object.keys(selectedBatch.data[0] || {}).filter(k => !k.startsWith('_') && !['id', 'isRelevant'].includes(k.toLowerCase())).map(header => (
                          <th key={header} className="px-6 py-5 border-l border-white/5 min-w-[180px]">
                            <div className="flex flex-col gap-1">
                              <span>{header}</span>
                              {selectedBatch.metadataMap?.[header] && (
                                <span className="text-[#4b778d] bg-[#4b778d]/10 px-1.5 py-0.5 rounded text-[8px] border border-[#4b778d]/20 w-fit font-mono">
                                  MAP TO: {selectedBatch.metadataMap[header]}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {selectedBatch.data.map(row => (
                        <tr key={row.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                           {Object.keys(row).filter(k => !k.startsWith('_') && !['id', 'isRelevant'].includes(k.toLowerCase())).map(cellKey => (
                             <td key={cellKey} className="px-6 py-4 text-xs font-medium border-l text-slate-600">
                                {row[cellKey] || '-'}
                             </td>
                           ))}
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Data Journey Central</h3>
              <p className="text-sm text-slate-500 font-medium">End-to-end migration orchestration for Material Master.</p>
            </div>
            <label className="bg-[#4b778d] text-white px-8 py-3 rounded-2xl font-black cursor-pointer flex items-center gap-3 shadow-lg">
               <i className="fas fa-cloud-upload"></i> Upload Legacy Load
               <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { setPendingFile(e.target.files?.[0] || null); setShowPrompt(true); }} accept=".csv" />
            </label>
          </div>
          
          <div className="grid gap-4">
            {batches.map(batch => (
              <div 
                key={batch.id} 
                className="bg-white p-6 rounded-2xl border shadow-sm flex justify-between items-center hover:shadow-md transition-all cursor-pointer group" 
                onClick={() => handleOpenBatch(batch.id)}
              >
                <div className="flex gap-6 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center font-black">
                    <span className="text-[8px] opacity-60">VER</span>
                    <span className="text-lg">{batch.version}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-slate-800 group-hover:text-[#4b778d] text-sm">{batch.batchNumber}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{batch.description}</p>
                    <div className="flex gap-1 mt-2">
                       {workflowSteps.map((s, i) => (
                         <div key={s} className={`w-1.5 h-1.5 rounded-full ${workflowSteps.indexOf(batch.status) >= i ? 'bg-[#4b778d]' : 'bg-slate-100'}`}></div>
                       ))}
                    </div>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-slate-200 group-hover:text-[#4b778d] group-hover:translate-x-1 transition-all"></i>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && selectedBatch && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden border">
            <div className="bg-[#1d1d1b] p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Pre-Flight Analytics</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedBatch.batchNumber} - Load Profile</p>
              </div>
              <button onClick={() => setShowAnalytics(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-4 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Completeness</p>
                  <h4 className="text-3xl font-black text-[#4b778d]">{batchStats?.completeness}%</h4>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Duplicates</p>
                  <h4 className="text-3xl font-black text-amber-500">{batchStats?.duplicates}</h4>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Rows</p>
                  <h4 className="text-3xl font-black text-slate-800">{batchStats?.totalRows}</h4>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Quality Score</p>
                  <h4 className="text-3xl font-black text-emerald-500">{batchStats?.qualityScore?.toFixed(0)}</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 h-80">
                  <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">Field Fill Rate %</h5>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={Object.keys(selectedBatch.data[0] || {}).filter(k => !k.startsWith('_')).map(k => ({
                      name: k,
                      val: Math.round((selectedBatch.data.filter(r => r[k]).length / selectedBatch.data.length) * 100)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="val" fill="#4b778d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center">
                  <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Object Health Profile</h5>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Populated', value: batchStats?.completeness || 0 },
                            { name: 'Empty', value: 100 - (batchStats?.completeness || 0) }
                          ]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#4b778d" />
                          <Cell fill="#f1f5f9" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-4 italic">Estimated cleansing effort: {batchStats && batchStats.completeness < 80 ? 'HIGH' : 'LOW'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden border shadow-2xl">
            <div className="bg-[#1d1d1b] p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">Register Load</h3>
              </div>
              <button onClick={() => setShowPrompt(false)} className="text-white/40 hover:text-white transition-all"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-8 space-y-6">
              <textarea 
                className="w-full p-4 border rounded-2xl bg-slate-50 h-32 text-sm font-bold focus:ring-2 focus:ring-[#4b778d] outline-none" 
                placeholder="e.g. S/4HANA Global Rollout - Wave 1..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
              <button 
                onClick={confirmUpload} 
                disabled={!description.trim() || isProcessing}
                className="w-full bg-[#4b778d] text-white py-4 rounded-2xl font-black shadow-xl"
              >
                Create Batch & Start ETL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
