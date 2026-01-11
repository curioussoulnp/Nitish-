
import React, { useState } from 'react';
import { User, UserRole, Project } from '../types';

interface LoginProps {
  onLogin: (user: User, project: Project) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [error, setError] = useState('');

  const AVAILABLE_PROJECTS: Project[] = [
    { id: 'P001', code: 'PRJ_EU_25', name: 'Europe S/4HANA Transformation', description: 'Global rollout Wave 1' },
    { id: 'P002', code: 'PRJ_NA_26', name: 'North America Data Cleansing', description: 'Global rollout Wave 2' }
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const project = AVAILABLE_PROJECTS.find(p => p.code === projectCode.toUpperCase());
    
    if (!project) {
      setError('Invalid Project Code. Please contact your system administrator.');
      return;
    }

    if (username === '0000' && password === '0000') {
      onLogin({
        id: 'admin-1',
        name: 'Protiviti Admin',
        email: 'admin@protiviti.com',
        role: UserRole.ADMIN,
        status: 'Active',
        lastLogin: new Date().toLocaleString(),
        assignedGroups: ['g-admin'],
        assignedProjects: ['P001', 'P002'],
        assignedWorkflows: ['L1', 'L2', 'L3']
      }, project);
    } else {
      setError('Invalid credentials. (Hint: Use 0000/0000)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4b778d]/5 rounded-full blur-[120px]"></div>
      <div className="w-full max-w-md z-10 p-4">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-10">
            <div className="flex flex-col items-center mb-10">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Protiviti_Logo.svg/1280px-Protiviti_Logo.svg.png" 
                alt="Protiviti" className="max-w-[200px] mb-6"
              />
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-[#333333]">Pro<span className="text-[#4b778d] italic">MDM</span></span>
                <span className="text-[10px] font-bold bg-[#333333] text-white px-2 py-0.5 rounded">V2.5</span>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Identifier</label>
                <input 
                  type="text" required placeholder="e.g. PRJ_EU_25"
                  className="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#4b778d] outline-none uppercase"
                  value={projectCode} onChange={(e) => setProjectCode(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <input 
                    type="text" required placeholder="0000"
                    className="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4b778d] outline-none"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" required placeholder="••••"
                    className="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#4b778d] outline-none"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}

              <button type="submit" className="w-full bg-[#333333] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#4b778d] transition-all mt-4">
                Enter Project Workspace <i className="fas fa-arrow-right ml-2 text-[10px]"></i>
              </button>
            </form>
          </div>
          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">© 2025 Protiviti Global</p>
          </div>
        </div>
      </div>
    </div>
  );
};
