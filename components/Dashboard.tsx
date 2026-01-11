
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const dataCleaning = [
  { name: 'M20250001', valPct: 100, transPct: 100, appPct: 100 },
  { name: 'M20250002', valPct: 100, transPct: 80, appPct: 0 },
  { name: 'M20250003', valPct: 45, transPct: 0, appPct: 0 },
  { name: 'M20250004', valPct: 10, transPct: 0, appPct: 0 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1'];

const pieData = [
  { name: 'Approved', value: 15 },
  { name: 'Validated', value: 25 },
  { name: 'Transformed', value: 20 },
  { name: 'Draft', value: 40 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Migration Batches', val: '14', icon: 'fa-layer-group', color: 'blue' },
          { label: 'Validation Rate', val: '92.4%', icon: 'fa-check-double', color: 'green' },
          { label: 'Pending Approvals', val: '08', icon: 'fa-signature', color: 'amber' },
          { label: 'S/4 Ready Recs', val: '8,420', icon: 'fa-wand-magic-sparkles', color: 'indigo' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.val}</h3>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800">Batch-wise Validation Metrics</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCleaning} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar name="Metadata Validated" dataKey="valPct" fill="#10b981" radius={[0, 4, 4, 0]} barSize={15} />
                <Bar name="Transformation Progress" dataKey="transPct" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                <Bar name="Approval Status" dataKey="appPct" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6">Object Lifecycle Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
