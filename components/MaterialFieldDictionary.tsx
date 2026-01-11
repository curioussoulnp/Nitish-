
import React, { useState } from 'react';
import { SAPTable, SAPField } from '../types';

interface DictionaryProps {
  tables: SAPTable[];
  setTables: React.Dispatch<React.SetStateAction<SAPTable[]>>;
}

export const MaterialFieldDictionary: React.FC<DictionaryProps> = ({ tables, setTables }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTables, setExpandedTables] = useState<string[]>(['MARA', 'MARC']);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<{ field: SAPField; tableName: string } | null>(null);
  
  // State for new field/table creation
  const [isNewTable, setIsNewTable] = useState(false);
  const [newTableData, setNewTableData] = useState({ name: '', description: '' });
  const [newField, setNewField] = useState<SAPField & { tableName: string }>({
    label: '',
    technicalName: '',
    dataType: 'CHAR',
    length: 10,
    tableName: 'MARA'
  });

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName) 
        : [...prev, tableName]
    );
  };

  const handleAddField = () => {
    if (!newField.label || !newField.technicalName) return;
    const { tableName: targetTableName, ...fieldData } = newField;

    if (isNewTable) {
      const finalTableName = newTableData.name.toUpperCase() || 'CUSTOM';
      const newTable: SAPTable = {
        tableName: finalTableName,
        description: newTableData.description || 'Custom Added Table',
        fields: [fieldData]
      };
      setTables(prev => [...prev, newTable]);
      setExpandedTables(prev => [...prev, finalTableName]);
    } else {
      setTables(prev => prev.map(table => 
        table.tableName === targetTableName ? { ...table, fields: [...table.fields, fieldData] } : table
      ));
    }
    setShowAddField(false);
    resetForm();
  };

  const handleUpdateField = () => {
    if (!editingField) return;
    setTables(prev => prev.map(t => {
      if (t.tableName === editingField.tableName) {
        return {
          ...t,
          fields: t.fields.map(f => f.technicalName === editingField.field.technicalName ? editingField.field : f)
        };
      }
      return t;
    }));
    setEditingField(null);
  };

  const resetForm = () => {
    setIsNewTable(false);
    setNewTableData({ name: '', description: '' });
    setNewField({ label: '', technicalName: '', dataType: 'CHAR', length: 10, tableName: 'MARA' });
  };

  const filteredTables = tables.map(table => {
    const fields = table.fields.filter(f => 
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.technicalName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...table, fields };
  }).filter(table => table.fields.length > 0 || table.tableName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">S/4HANA Master Data Dictionary</h3>
          <p className="text-sm text-slate-500 font-medium">Standard and custom target structures for Material Master migration.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text" 
              placeholder="Search fields or tables..." 
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-80 shadow-sm focus:ring-2 focus:ring-[#4b778d] outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddField(true)}
            className="bg-[#4b778d] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#4b778d]/20 hover:bg-[#3a5d6e] transition-all flex items-center gap-2 group"
          >
            <i className="fas fa-plus group-hover:rotate-90 transition-transform"></i> Add Field
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTables.map(table => (
          <div key={table.tableName} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group/table">
            <button 
              onClick={() => toggleTable(table.tableName)}
              className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/50 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className="bg-[#1d1d1b] text-white px-3 py-1.5 rounded-lg font-black text-[11px] tracking-widest uppercase shadow-sm">
                  {table.tableName}
                </div>
                <div className="text-left">
                  <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">{table.description}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{table.fields.length} Technical Fields</p>
                </div>
              </div>
              <i className={`fas fa-chevron-right text-slate-300 text-xs transition-transform duration-300 ${expandedTables.includes(table.tableName) ? 'rotate-90 text-[#4b778d]' : ''}`}></i>
            </button>

            {expandedTables.includes(table.tableName) && (
              <div className="p-0 border-t border-slate-100 animate-fadeIn">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Label</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical ID</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data Type</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Length</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {table.fields.map(field => (
                      <tr key={`${table.tableName}-${field.technicalName}`} className="hover:bg-blue-50/20 transition-colors group/row">
                        <td className="px-8 py-4"><span className="text-sm font-bold text-slate-700">{field.label}</span></td>
                        <td className="px-8 py-4">
                          <span className="font-mono text-[11px] px-2.5 py-1 bg-slate-100 text-[#4b778d] rounded-md border border-slate-200">
                            {field.technicalName}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-white text-[10px] font-black text-slate-500 uppercase border border-slate-200">
                            {field.dataType}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-center"><span className="text-xs font-black text-slate-800">{field.length}</span></td>
                        <td className="px-8 py-4 text-right">
                          <button 
                            onClick={() => setEditingField({ field: { ...field }, tableName: table.tableName })}
                            className="text-slate-400 hover:text-[#4b778d] transition-colors p-2 bg-slate-50 rounded-lg hover:shadow-sm"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Editing Modal */}
      {editingField && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#4b778d] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">Edit {editingField.field.technicalName}</h3>
              <button onClick={() => setEditingField(null)} className="text-white/60 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Label</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-[#4b778d] outline-none"
                  value={editingField.field.label}
                  onChange={e => setEditingField({ ...editingField, field: { ...editingField.field, label: e.target.value } })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                  <select 
                    className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-black focus:ring-2 focus:ring-[#4b778d] outline-none"
                    value={editingField.field.dataType}
                    onChange={e => setEditingField({ ...editingField, field: { ...editingField.field, dataType: e.target.value } })}
                  >
                    {['CHAR', 'NUMC', 'DATS', 'UNIT', 'CURR', 'QUAN'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Length</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-black focus:ring-2 focus:ring-[#4b778d] outline-none"
                    value={editingField.field.length}
                    onChange={e => setEditingField({ ...editingField, field: { ...editingField.field, length: parseInt(e.target.value) } })}
                  />
                </div>
              </div>
              <button onClick={handleUpdateField} className="w-full bg-[#4b778d] text-white py-4 rounded-2xl font-black shadow-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showAddField && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="bg-[#1d1d1b] p-8 text-white flex justify-between items-start">
              <h3 className="text-2xl font-black tracking-tight">Register Field Metadata</h3>
              <button onClick={() => { setShowAddField(false); resetForm(); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">1. Structural Unit</label>
                <button 
                  onClick={() => setIsNewTable(!isNewTable)}
                  className={`text-[10px] font-black uppercase py-1.5 px-4 rounded-full transition-all border ${isNewTable ? 'bg-blue-50 text-[#4b778d] border-[#4b778d]/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                >
                  {isNewTable ? 'Use Existing' : '+ New Table'}
                </button>
              </div>
              {isNewTable ? (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border">
                  <input placeholder="Table ID (Z...)" className="p-3 border rounded-xl font-black uppercase" value={newTableData.name} onChange={e => setNewTableData({...newTableData, name: e.target.value})} />
                  <input placeholder="Description" className="p-3 border rounded-xl font-bold" value={newTableData.description} onChange={e => setNewTableData({...newTableData, description: e.target.value})} />
                </div>
              ) : (
                <select 
                  className="w-full p-3.5 border border-slate-200 rounded-xl text-sm font-black bg-slate-50 outline-none"
                  value={newField.tableName}
                  onChange={e => setNewField({...newField, tableName: e.target.value})}
                >
                  {tables.map(t => <option key={t.tableName} value={t.tableName}>{t.tableName} - {t.description}</option>)}
                </select>
              )}
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Field Label" className="col-span-2 p-3.5 border rounded-xl font-bold" value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} />
                <input placeholder="Technical Name" className="p-3.5 border rounded-xl font-mono uppercase" value={newField.technicalName} onChange={e => setNewField({...newField, technicalName: e.target.value})} />
                <div className="flex gap-2">
                  <select className="flex-1 p-3.5 border rounded-xl font-black" value={newField.dataType} onChange={e => setNewField({...newField, dataType: e.target.value})}>
                    {['CHAR', 'NUMC', 'DATS', 'UNIT', 'CURR', 'QUAN'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input type="number" className="w-20 p-3.5 border rounded-xl font-black" value={newField.length} onChange={e => setNewField({...newField, length: parseInt(e.target.value)})} />
                </div>
              </div>
              <button onClick={handleAddField} className="w-full bg-[#4b778d] text-white py-4 rounded-2xl font-black shadow-xl">Register Field</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
