
import React from 'react';
import { ICONS, TRANSLATIONS } from '../constants';
import { Language, UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  lang: Language;
  role: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, lang, role, onLogout }) => {
  const t = TRANSLATIONS[lang];

  const menuItems = role === 'admin' ? [
    { id: 'dashboard', label: 'Admin Panel', icon: ICONS.Dashboard },
    { id: 'settings', label: 'System Config', icon: ICONS.Settings },
  ] : [
    { id: 'dashboard', label: t.dashboard, icon: ICONS.Dashboard },
    { id: 'analyze', label: t.analyze, icon: ICONS.Analyze },
    { id: 'live', label: t.liveFeed, icon: ICONS.Live },
    { id: 'reports', label: t.reports, icon: ICONS.Reports },
    { id: 'settings', label: t.settings, icon: ICONS.Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 pb-12">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">
            F
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            FinPulse<span className="text-blue-600">.ai</span>
          </h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Core Platform</p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  currentView === item.id
                    ? 'active-gradient text-slate-900 border border-slate-300/50 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className={`${currentView === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
                  <item.icon size={20} />
                </div>
                <span className="font-bold text-xs tracking-tight">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-[10px] font-black uppercase tracking-widest group"
        >
          <span>System Logout</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
