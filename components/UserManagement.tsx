
import React, { useState } from 'react';
import { User, UserRole, WorkflowGroup } from '../types';

interface UserMgmtProps {
  groups: WorkflowGroup[];
  currentProjectId: string;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const UserManagement: React.FC<UserMgmtProps> = ({ groups, currentProjectId, users, setUsers }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User & { username?: string, password?: string }>>({ 
    role: UserRole.VIEWER, 
    status: 'Active', 
    assignedGroups: [],
    username: '',
    password: ''
  });

  const addUser = () => {
    if (!newUser.name || !newUser.email || !newUser.username || !newUser.password) {
      alert('Please fill in all mandatory identity fields (Name, Email, Username, and Password).');
      return;
    }
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name!,
      email: newUser.email!,
      role: newUser.role!,
      status: 'Active',
      lastLogin: 'Never',
      assignedGroups: newUser.assignedGroups!,
      assignedWorkflows: [],
      assignedProjects: [currentProjectId]
    };
    setUsers([...users, user]);
    setShowAddModal(false);
    setNewUser({ role: UserRole.VIEWER, status: 'Active', assignedGroups: [], username: '', password: '' });
  };

  const toggleGroup = (groupId: string) => {
    const current = newUser.assignedGroups || [];
    if (current.includes(groupId)) {
      setNewUser({ ...newUser, assignedGroups: current.filter(id => id !== groupId) });
    } else {
      setNewUser({ ...newUser, assignedGroups: [...current, groupId] });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Identity Governance</h3>
          <p className="text-sm text-slate-500 italic">Manage users, login credentials, and associated Workflow Authority Groups.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-[#4b778d] transition-all flex items-center gap-2"
        >
          <i className="fas fa-user-shield"></i> Provision New Identity
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity & Username</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Role</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Groups</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#4b778d] flex items-center justify-center font-black text-xs border border-slate-200">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                        <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono">ID: {user.email.split('@')[0]}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                    user.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.assignedGroups.length > 0 ? user.assignedGroups.map(gid => {
                      const g = groups.find(x => x.id === gid);
                      return (
                        <span key={gid} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold border border-blue-100">
                          {g?.name || 'Unknown Group'}
                        </span>
                      );
                    }) : <span className="text-[10px] text-slate-300 italic">No Group Access</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#4b778d] transition-all"><i className="fas fa-key text-[10px]"></i></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all"><i className="fas fa-user-minus text-[10px]"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="bg-[#1d1d1b] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">Provision Enterprise Identity</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identity & Access Management</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-[#4b778d] uppercase tracking-widest border-b pb-2">1. Personal Profile</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Legal Name</label>
                    <input type="text" placeholder="e.g. John Doe" className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold outline-none focus:ring-2 focus:ring-[#4b778d]" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Corporate Email</label>
                    <input type="email" placeholder="john.doe@protiviti.com" className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold outline-none focus:ring-2 focus:ring-[#4b778d]" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-[#4b778d] uppercase tracking-widest border-b pb-2">2. Login Credentials</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Account Username</label>
                    <div className="relative">
                      <i className="fas fa-at absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"></i>
                      <input type="text" placeholder="jdoe_admin" className="w-full pl-8 p-3 border rounded-xl bg-slate-50 text-sm font-bold outline-none focus:ring-2 focus:ring-[#4b778d]" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">System Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold outline-none focus:ring-2 focus:ring-[#4b778d]" 
                        value={newUser.password} 
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-[10px]`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-[#4b778d] uppercase tracking-widest border-b pb-2">3. Role & Governance</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Global System Role</label>
                  <select className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-black outline-none focus:ring-2 focus:ring-[#4b778d]" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Workflow Group Memberships</label>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-xl bg-slate-50">
                    {groups.map(g => (
                      <button 
                        key={g.id}
                        type="button"
                        onClick={() => toggleGroup(g.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                          newUser.assignedGroups?.includes(g.id) ? 'bg-white border-blue-200 shadow-sm' : 'border-transparent hover:bg-white/50'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full shrink-0 ${newUser.assignedGroups?.includes(g.id) ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                        <span className="text-[10px] font-bold text-slate-700 truncate">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <button 
                onClick={addUser}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#4b778d] transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-shield-check"></i> Provision Account & Notify User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
