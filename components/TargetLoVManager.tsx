
import React, { useState } from 'react';
import { SAP_MATERIAL_TABLES } from '../types';

interface LoVEntry {
  code: string;
  description: string;
}

interface CustomField {
  technicalName: string;
  label: string;
  tableName: string;
}

export const TargetLoVManager: React.FC = () => {
  const [selectedField, setSelectedField] = useState<string>('MTART');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddValue, setShowAddValue] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [newValue, setNewValue] = useState({ code: '', description: '' });
  const [newField, setNewField] = useState<CustomField>({ technicalName: '', label: '', tableName: 'MARA' });

  // Initializing with standard fields from types
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [lovStore, setLovStore] = useState<Record<string, LoVEntry[]>>({
    'MTART': [
      { code: 'FERT', description: 'Finished Product' },
      { code: 'HALB', description: 'Semi-finished Product' },
      { code: 'ROH', description: 'Raw Material' },
      { code: 'HIBE', description: 'Operating Supplies' },
      { code: 'DIEN', description: 'Service' }
    ],
    'WERKS': [
      { code: '1000', description: 'Plant Hamburg' },
      { code: '1100', description: 'Plant Berlin' },
      { code: '2000', description: 'Plant New York' },
      { code: '3000', description: 'Plant Singapore' }
    ],
    'MEINS': [
      { code: 'PC', description: 'Piece' },
      { code: 'KG', description: 'Kilogram' },
      { code: 'M', description: 'Meter' },
      { code: 'L', description: 'Liter' }
    ],
    'MATKL': [
      { code: '01', description: 'Electronics' },
      { code: '02', description: 'Mechanical Components' },
      { code: '03', description: 'Consumables' }
    ],
    'VKORG': [
      { code: '1000', description: 'Sales Org Domestic' },
      { code: '1100', description: 'Sales Org Export' },
      { code: '2000', description: 'Sales Org US West' },
      { code: '3000', description: 'Sales Org Asia-Pac' }
    ],
    'VTWEG': [
      { code: '10', description: 'Direct Sales' },
      { code: '20', description: 'Wholesale' },
      { code: '30', description: 'Retail' }
    ],
    'EKGRP': [
      { code: '001', description: 'Raw Materials Group' },
      { code: '002', description: 'Electrical Components' },
      { code: '003', description: 'Services / Indirect' }
    ],
    'DISPO': [
      { code: '001', description: 'Main Planner - Production' },
      { code: '002', description: 'Material Controller - External' },
      { code: '003', description: 'Spare Parts Planner' }
    ],
    'MBRSH': [
      { code: 'M', description: 'Mechanical Engineering' },
      { code: 'C', description: 'Chemical Industry' },
      { code: 'P', description: 'Pharmaceuticals' },
      { code: 'E', description: 'Electronics' }
    ]
  });

  const standardFields = SAP_MATERIAL_TABLES.flatMap(t => 
    t.fields.map(f => ({ technicalName: f.technicalName, label: f.label, tableName: t.tableName }))
  ).filter(f => [
    'MTART', 'WERKS', 'MEINS', 'MATKL', 'SPART', 
    'EKGRP', 'VKORG', 'VTWEG', 'DISPO', 'MBRSH'
  ].includes(f.technicalName));

  const allAvailableFields = [...standardFields, ...customFields];

  const currentLoV = lovStore[selectedField] || [];
  const filteredLoV = currentLoV.filter(v => 
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddValue = () => {
    if (!newValue.code || !newValue.description) return;
    
    setLovStore(prev => {
      const existingEntries = prev[selectedField] || [];
      if (existingEntries.some(e => e.code === newValue.code)) {
        alert('This code already exists for the selected field.');
        return prev;
      }
      return {
        ...prev,
        [selectedField]: [...existingEntries, { ...newValue }]
      };
    });

    setNewValue({ code: '', description: '' });
    setShowAddValue(false);
  };

  const handleAddField = () => {
    if (!newField.technicalName || !newField.label) return;
    setCustomFields(prev => [...prev, newField]);
    setSelectedField(newField.technicalName);
    setShowAddField(false);
    setNewField({ technicalName: '', label: '', tableName: 'MARA' });
  };

  const removeValue = (code: string) => {
    if (confirm(`Are you sure you want to remove the code ${code}?`)) {
      setLovStore(prev => ({
        ...prev,
        [selectedField]: (prev[selectedField] || []).filter(v => v.code !== code)
      }));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Target List of Values (LoV)</h3>
          <p className="text-sm text-slate-500 font-medium">Manage valid target system codes for value-mapping and validation.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text" 
              placeholder="Search values..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-64 shadow-sm focus:ring-2 focus:ring-[#4b778d] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddValue(true)}
            className="bg-[#4b778d] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#4b778d]/20 hover:bg-[#3a5d6e] transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Add Value
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Field Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Fields</label>
            <button 
              onClick={() => setShowAddField(true)}
              className="text-[9px] font-black text-[#4b778d] uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <i className="fas fa-plus-circle"></i> New Field
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-h-[70vh] overflow-y-auto custom-scrollbar">
            {allAvailableFields.map(field => (
              <button
                key={field.technicalName}
                onClick={() => setSelectedField(field.technicalName)}
                className={`w-full text-left px-4 py-4 border-b border-slate-50 transition-all flex items-center justify-between group ${
                  selectedField === field.technicalName ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedField === field.technicalName ? 'bg-[#4b778d]' : 'bg-slate-200 group-hover:bg-slate-300'}`}></span>
                    <span className={`text-xs font-black ${selectedField === field.technicalName ? 'text-slate-800' : 'text-slate-500'}`}>{field.technicalName}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold ml-4 mt-0.5 truncate max-w-[150px]">{field.label}</p>
                </div>
                <i className={`fas fa-chevron-right text-[10px] transition-transform ${selectedField === field.technicalName ? 'text-[#4b778d] translate-x-1' : 'text-slate-200'}`}></i>
              </button>
            ))}
          </div>
        </div>

        {/* Right Main: Value Management */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-[#1d1d1b] text-white px-3 py-1 rounded-lg font-black text-[10px] tracking-widest uppercase">
                  {selectedField}
                </div>
                <h4 className="font-bold text-slate-800">
                  {allAvailableFields.find(f => f.technicalName === selectedField)?.label} - Valid Values
                </h4>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredLoV.length} entries</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-slate-50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid Code</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Mapping Target</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLoV.length > 0 ? (
                    filteredLoV.map(val => (
                      <tr key={val.code} className="hover:bg-slate-50/50 transition-colors group animate-fadeIn">
                        <td className="px-8 py-4">
                          <span className="font-mono text-xs font-black text-[#4b778d] bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50">
                            {val.code}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-bold text-slate-700">{val.description}</span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-[#4b778d] transition-colors">
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button 
                              onClick={() => removeValue(val.code)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <i className="fas fa-folder-open text-4xl text-slate-100 mb-4"></i>
                        <p className="text-slate-400 font-bold text-sm tracking-tight">No List of Values found for this selection.</p>
                        <button onClick={() => setShowAddValue(true)} className="mt-4 text-[#4b778d] font-black text-[10px] uppercase tracking-widest hover:underline">Register first entry</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Field Modal */}
      {showAddField && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#1d1d1b] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">Register New Target Field</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">LoV Discovery</p>
              </div>
              <button onClick={() => setShowAddField(false)} className="text-slate-400 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Technical Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-black focus:ring-2 focus:ring-[#4b778d] outline-none uppercase"
                  placeholder="e.g. Z_MAT_CAT"
                  value={newField.technicalName}
                  onChange={e => setNewField({...newField, technicalName: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Label</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-[#4b778d] outline-none"
                  placeholder="e.g. Material Category"
                  value={newField.label}
                  onChange={e => setNewField({...newField, label: e.target.value})}
                />
              </div>
              <button 
                onClick={handleAddField}
                disabled={!newField.technicalName || !newField.label}
                className="w-full bg-[#1d1d1b] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Register Field & Add Values
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Value Modal */}
      {showAddValue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#1d1d1b] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">Register Valid Code</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Field: {selectedField}</p>
              </div>
              <button onClick={() => setShowAddValue(false)} className="text-slate-400 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SAP Target Code</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-black focus:ring-2 focus:ring-[#4b778d] outline-none uppercase"
                  placeholder="e.g. FERT"
                  value={newValue.code}
                  onChange={e => setNewValue({...newValue, code: e.target.value.toUpperCase()})}
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-[#4b778d] outline-none"
                  placeholder="e.g. Finished Product"
                  value={newValue.description}
                  onChange={e => setNewValue({...newValue, description: e.target.value})}
                />
              </div>
              <button 
                onClick={handleAddValue}
                disabled={!newValue.code || !newValue.description}
                className="w-full bg-[#4b778d] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#3a5d6e] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <i className="fas fa-check-circle"></i> Add to LoV Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
