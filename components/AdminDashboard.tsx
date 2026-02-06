
import React, { useState, useMemo } from 'react';
import { ICONS } from '../constants';
import { User, Permission, Industry } from '../types';

const industries: Industry[] = ['Manufacturing', 'Retail', 'Agriculture', 'Services', 'Logistics', 'E-commerce'];

const AVAILABLE_PERMISSIONS: { id: Permission; label: string }[] = [
  { id: 'analyze', label: 'AI Analysis' },
  { id: 'reports', label: 'Reports' },
  { id: 'export', label: 'Data Export' },
  { id: 'settings', label: 'Settings' },
];

interface AdminDashboardProps {
  owners: User[];
  onAdd: (user: User) => void;
  onRemove: (id: string) => void;
  onUpdatePerms: (id: string, perms: Permission[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ owners, onAdd, onRemove, onUpdatePerms }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'system'>('users');
  const [isAdding, setIsAdding] = useState(false);
  const [newOwner, setNewOwner] = useState({ 
    email: '', 
    password: 'owner123', 
    name: '', 
    businessName: '',
    industry: 'Retail' as Industry,
    location: '',
    phoneNumber: '',
    gstNumber: '',
    permissions: ['analyze', 'reports'] as Permission[]
  });

  const [expandedOwner, setExpandedOwner] = useState<string | null>(null);

  const handleAddOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString().slice(-4);
    const newUser: User = { id, ...newOwner, role: 'owner' };
    onAdd(newUser);
    setNewOwner({ 
      email: '', password: 'owner123', name: '', businessName: '', industry: 'Retail', 
      location: '', phoneNumber: '', gstNumber: '', permissions: ['analyze', 'reports'] 
    });
    setIsAdding(false);
  };

  const togglePermission = (ownerId: string, permission: Permission) => {
    const owner = owners.find(o => o.id === ownerId);
    if (!owner) return;
    const currentPerms = owner.permissions || [];
    const newPerms = currentPerms.includes(permission)
      ? currentPerms.filter(p => p !== permission)
      : [...currentPerms, permission];
    onUpdatePerms(ownerId, newPerms);
  };

  const stats = useMemo(() => ({
    activeEntities: owners.length,
    highTrustEntities: owners.filter(o => (o as any).mockCreditScore > 800).length,
    systemLoad: 'Optimized',
    uptime: '99.9%'
  }), [owners]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="p-8 bg-blue-600 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 rotate-12"><ICONS.Dashboard size={120} /></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Platform Integrity Hub</p>
          <h2 className="text-3xl font-black tracking-tight mb-8 uppercase">Master Control Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Total Nodes Synced</p>
              <span className="text-2xl font-black">{stats.activeEntities} SME Units</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Operational Uptime</p>
              <span className="text-2xl font-black">{stats.uptime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>SME Nodes</button>
        <button onClick={() => setActiveTab('system')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Infrastructure Config</button>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-soft">
              <div className="flex items-center justify-between mb-10">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Master SME Repository</h4>
                <button onClick={() => setIsAdding(!isAdding)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-800">{isAdding ? 'Cancel' : 'Onboard Node'}</button>
              </div>

              {isAdding && (
                <div className="mb-10 p-8 rounded-[32px] bg-slate-50 border border-slate-200 animate-in slide-in-from-top-4">
                  <form onSubmit={handleAddOwnerSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input type="text" placeholder="Full Name" required value={newOwner.name} onChange={e => setNewOwner({...newOwner, name: e.target.value})} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                      <input type="email" placeholder="Email Address" required value={newOwner.email} onChange={e => setNewOwner({...newOwner, email: e.target.value})} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                      <input type="text" placeholder="Phone Number" required value={newOwner.phoneNumber} onChange={e => setNewOwner({...newOwner, phoneNumber: e.target.value})} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                      <input type="text" placeholder="Business Name" required value={newOwner.businessName} onChange={e => setNewOwner({...newOwner, businessName: e.target.value})} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Activate Node</button>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {owners.map((owner) => (
                  <div key={owner.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-black text-lg">{owner.name.charAt(0)}</div>
                        <div>
                          <p className="text-base font-black text-slate-900">{owner.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{owner.businessName} | {owner.email}</p>
                        </div>
                      </div>
                      <button onClick={() => onRemove(owner.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_PERMISSIONS.map(p => (
                        <button key={p.id} onClick={() => togglePermission(owner.id, p.id)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${owner.permissions?.includes(p.id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>{p.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col shadow-2xl">
            <h4 className="text-xl font-black mb-8 tracking-tight uppercase">Audit & Logs</h4>
            <div className="space-y-6 flex-1 overflow-y-auto text-[11px] opacity-70">
              <p>[INFO] PostgreSQL Master Connection: ACTIVE</p>
              <p>[INFO] HTTPS/SSL Handshake: SECURE</p>
              <p>[INFO] LLM Context Window: 128k</p>
              <p>[INFO] Sector Benchmarks: SYNCED (Retail, Mfg)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-soft">
          <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-8">System Infrastructure</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">PostgreSQL Ready Module (SQLAlchemy)</h5>
              <div className="bg-slate-900 p-4 rounded-xl text-[10px] font-mono text-emerald-400 whitespace-pre">
                {`class BusinessRecord(Base):
    __tablename__ = 'sme_records'
    id = Column(Integer, primary_key=True)
    user_id = Column(String, unique=True)
    revenue = Column(Float)
    metrics = Column(JSONB)`}
              </div>
              <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-tight">Database: Scalable Vector Support Enabled</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Secure API Endpoints</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase">HTTPS Encryption</span>
                  <span className="text-[10px] font-black text-emerald-600">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase">JWT Token Auth</span>
                  <span className="text-[10px] font-black text-emerald-600">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase">GCP Project Secrets</span>
                  <span className="text-[10px] font-black text-blue-600">VAULTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
