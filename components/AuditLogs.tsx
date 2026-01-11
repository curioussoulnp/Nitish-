
import React from 'react';
import { ChangeLog } from '../types';

interface AuditLogsProps {
  currentProjectId: string;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ currentProjectId }) => {
  const logs: ChangeLog[] = [
    { id: 'l1', projectId: currentProjectId, timestamp: '2023-10-24 16:50', user: 'Admin', action: 'RULE_CHANGE', details: 'Modified mapping rule for WERKS to include conditional branching' },
    { id: 'l2', projectId: currentProjectId, timestamp: '2023-10-24 14:22', user: 'J. Smith', action: 'DATA_UPLOAD', details: 'Uploaded Batch-001 with 1250 records for Material Master' },
    { id: 'l3', projectId: currentProjectId, timestamp: '2023-10-23 09:15', user: 'A. Kumar', action: 'APPROVAL_L1', details: 'Level 1 Approval granted for Batch-20231022-X' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">System Audit Trail</h3>
        <button className="text-blue-600 text-sm font-semibold hover:underline">Download CSV Log</button>
      </div>
      <div className="p-0">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50/50">
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{log.user}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 font-bold text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
