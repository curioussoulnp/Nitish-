
import React from 'react';
import { User, Project } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedObject: string;
  setSelectedObject: (obj: string) => void;
  user: User | null;
  activeProject: Project | null;
  onLogout: () => void;
  projects?: Project[];
  setActiveProject?: (p: Project) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, setActiveTab, selectedObject, setSelectedObject, 
  user, activeProject, onLogout, projects = [], setActiveProject 
}) => {
  // Unified Protiviti Blue theme for all sections as requested
  const unifiedTheme = 'bg-[#4b778d] text-white';
  const unifiedIconColor = 'text-blue-400';

  const etlOps = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'uploads', icon: 'fa-sync-alt', label: 'Data Journey', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'harmonization', icon: 'fa-compress-arrows-alt', label: 'Data Harmonization', theme: unifiedTheme, iconColor: unifiedIconColor },
  ];

  const functionalOps = [
    { id: 'fields', icon: 'fa-list-check', label: 'Data Dictionary', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'lovs', icon: 'fa-tags', label: 'Target LoVs', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'harmonization_rules', icon: 'fa-wand-sparkles', label: 'Harmonization Rules', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'mapping', icon: 'fa-project-diagram', label: 'Transformation Rules', theme: unifiedTheme, iconColor: unifiedIconColor },
  ];

  const adminOps = [
    { id: 'tower', icon: 'fa-building-shield', label: 'Project Tower', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'users', icon: 'fa-user-shield', label: 'Identity Governance', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'groups', icon: 'fa-users-gear', label: 'Workflow Groups', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'workflow', icon: 'fa-tasks', label: 'Workflows', theme: unifiedTheme, iconColor: unifiedIconColor },
    { id: 'logs', icon: 'fa-history', label: 'Audit Logs', theme: unifiedTheme, iconColor: unifiedIconColor },
  ];

  const NavItem = ({ item }: { item: { id: string, icon: string, label: string, theme: string, iconColor: string } }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
          isActive 
            ? `${item.theme} shadow-lg shadow-black/30 font-bold scale-[1.02]` 
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
        }`}
      >
        <i className={`fas ${item.icon} w-4 text-[11px] ${isActive ? 'text-white' : `group-hover:${item.iconColor} transition-colors`}`}></i>
        <span className="text-[11px] tracking-tight">{item.label}</span>
        {isActive && (
          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/50"></div>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-[#111827] text-white flex flex-col shadow-2xl z-20 border-r border-slate-800">
        <div className="bg-white p-5 border-b flex items-center justify-center h-16 shrink-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Protiviti_Logo.svg/1280px-Protiviti_Logo.svg.png" className="h-5" alt="Protiviti" />
        </div>
        
        <div className="p-4 bg-slate-900/60 border-b border-white/5">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Active Project Context</p>
           <div className="bg-[#1e293b] p-3 rounded-xl border border-slate-700/50 shadow-inner group cursor-default">
              <p className="text-[11px] font-black text-[#4b778d] truncate group-hover:text-blue-400 transition-colors">{activeProject?.name}</p>
              <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-microchip text-[8px]"></i> {activeProject?.code}
              </p>
           </div>
        </div>

        <nav className="flex-1 p-3 space-y-6 overflow-y-auto custom-scrollbar">
          <section className="space-y-1">
            <div className="px-3 py-2 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-black text-[#4b778d] uppercase tracking-[0.15em]">Operations</span>
              <div className="h-px bg-[#4b778d]/30 flex-1 ml-3"></div>
            </div>
            <div className="space-y-0.5">
              {etlOps.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </section>

          <section className="space-y-1">
            <div className="px-3 py-2 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-black text-[#4b778d] uppercase tracking-[0.15em]">Configuration</span>
              <div className="h-px bg-[#4b778d]/30 flex-1 ml-3"></div>
            </div>
            <div className="space-y-0.5">
              {functionalOps.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </section>

          <section className="space-y-1">
            <div className="px-3 py-2 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-black text-[#4b778d] uppercase tracking-[0.15em]">Administration</span>
              <div className="h-px bg-[#4b778d]/30 flex-1 ml-3"></div>
            </div>
            <div className="space-y-0.5">
              {adminOps.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </section>
        </nav>

        <div className="p-4 border-t border-white/5 bg-slate-900 flex items-center justify-between h-16 shrink-0">
           <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#4b778d] flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg">
                {user?.name.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-black truncate">{user?.name}</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">{user?.role}</span>
              </div>
           </div>
           <button 
             onClick={onLogout} 
             className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
             title="Logout"
           >
             <i className="fas fa-power-off text-xs"></i>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <i className="fas fa-folder-tree text-slate-300 text-xs"></i>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="text-slate-400 font-black tracking-tight">{activeProject?.code}</span>
                <i className="fas fa-chevron-right text-[8px] text-slate-300"></i>
                <span className="text-[#4b778d] font-black tracking-tight">
                  {[...etlOps, ...functionalOps, ...adminOps].find(m => m.id === activeTab)?.label}
                </span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
                <button className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-white transition-all shadow-sm">
                  <i className="fas fa-shuffle text-[#4b778d]"></i> Switch Workspace
                </button>
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] overflow-hidden translate-y-2 group-hover:translate-y-0">
                   <div className="p-3 bg-slate-50 border-b text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                     <i className="fas fa-project-diagram"></i> Enrolled ETL Projects
                   </div>
                   <div className="max-h-64 overflow-y-auto custom-scrollbar">
                     {projects.map(p => (
                       <button 
                         key={p.id}
                         onClick={() => setActiveProject?.(p)}
                         className={`w-full text-left p-4 hover:bg-blue-50 transition-colors border-b last:border-0 relative ${activeProject?.id === p.id ? 'bg-blue-50/50' : ''}`}
                       >
                         {activeProject?.id === p.id && (
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4b778d]"></div>
                         )}
                         <p className="text-[11px] font-black text-slate-800">{p.code}</p>
                         <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.name}</p>
                       </button>
                     ))}
                   </div>
                </div>
             </div>
             <div className="h-6 w-px bg-slate-200"></div>
             <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#4b778d] hover:bg-white transition-all shadow-sm">
               <i className="fas fa-bell text-xs"></i>
             </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};
