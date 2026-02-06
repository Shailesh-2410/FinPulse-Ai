
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import AnalysisForm from './components/AnalysisForm';
import Reports from './components/Reports';
import Settings from './components/Settings';
import LiveFeed from './components/LiveFeed';
import PythonTerminal from './components/PythonTerminal';
import Login from './components/Login';
import SupportChatbot from './components/SupportChatbot';
import { AssessmentResult, FinancialData, Language, User, Permission, SavedReport, LoginSession, DailySalesEntry } from './types';
import { analyzeFinancialHealth } from './services/geminiService';
import { simulatePythonProcessing } from './services/pythonSimulator';
import { ICONS, TRANSLATIONS } from './constants';

const App: React.FC = () => {
  const [registeredOwners, setRegisteredOwners] = useState<User[]>([
    { id: '101', email: 'factory@shop.ai', password: 'owner123', name: 'Rajesh Kumar', role: 'owner', businessName: 'Kumar Manufacturing Unit', industry: 'Manufacturing', permissions: ['analyze', 'reports'], location: 'Pune, MH', gstNumber: '27AABCK0000Z1Z5', age: 42, phoneNumber: '+91 98234 56789', loginHistory: [] },
    { id: '102', email: 'kirana@shop.ai', password: 'owner123', name: 'Suresh Gupta', role: 'owner', businessName: 'Gupta Kirana Store', industry: 'Retail', permissions: ['analyze', 'reports'], location: 'Jaipur, RJ', gstNumber: '08ABCDE1234F1Z1', age: 38, phoneNumber: '+91 91234 11223', loginHistory: [] },
  ]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [reportHistory, setReportHistory] = useState<Record<string, SavedReport[]>>({});
  const [salesLogs, setSalesLogs] = useState<Record<string, DailySalesEntry[]>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [inputData, setInputData] = useState<FinancialData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pythonSteps, setPythonSteps] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (user: User) => {
    const session: LoginSession = {
      date: new Date().toLocaleString(),
      status: 'Success'
    };
    
    setRegisteredOwners(prev => prev.map(o => o.id === user.id ? { 
      ...o, 
      loginHistory: [session, ...(o.loginHistory || [])].slice(0, 5) 
    } : o));

    const updatedUser = user.role === 'admin' ? user : { 
      ...user, 
      loginHistory: [session, ...(user.loginHistory || [])].slice(0, 5) 
    };

    setCurrentUser(updatedUser);
    setCurrentView('dashboard');
    
    const userHistory = reportHistory[user.id] || [];
    if (userHistory.length > 0) {
      setAssessment(userHistory[0].assessment);
      setInputData(userHistory[0].data);
    } else {
      setAssessment(null);
      setInputData(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAssessment(null);
    setInputData(null);
    setCurrentView('dashboard');
  };

  const handleAddSalesEntry = (entry: DailySalesEntry) => {
    if (!currentUser) return;
    setSalesLogs(prev => {
      const currentEntries = prev[currentUser.id] || [];
      const filtered = currentEntries.filter(e => e.date !== entry.date);
      return {
        ...prev,
        [currentUser.id]: [...filtered, entry]
      };
    });
  };

  const handleAddOwner = (user: User) => {
    setRegisteredOwners(prev => [...prev, { ...user, loginHistory: [] }]);
  };

  const handleRemoveOwner = (id: string) => {
    setRegisteredOwners(prev => prev.filter(o => o.id !== id));
    setReportHistory(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleUpdatePerms = (id: string, perms: Permission[]) => {
    setRegisteredOwners(prev => prev.map(o => o.id === id ? { ...o, permissions: perms } : o));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, permissions: perms } : null);
    }
  };

  const handleUpdateProfile = (updatedProfile: Partial<User>) => {
    if (!currentUser) return;
    const newProfile = { ...currentUser, ...updatedProfile };
    setCurrentUser(newProfile);
    setRegisteredOwners(prev => prev.map(o => o.id === currentUser.id ? newProfile : o));
  };

  const handleAnalyze = async (data: FinancialData) => {
    if (!currentUser) return;
    setIsProcessing(true);
    setShowTerminal(true);
    setError(null);
    setInputData(data);
    
    try {
      const steps = await simulatePythonProcessing(data);
      setPythonSteps(steps);
      
      const userHistory = reportHistory[currentUser.id] || [];
      const result = await analyzeFinancialHealth(data, userHistory);
      setAssessment(result);
      
      const newReport: SavedReport = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        data: data,
        assessment: result
      };
      
      setReportHistory(prev => ({
        ...prev,
        [currentUser.id]: [newReport, ...(prev[currentUser.id] || [])].slice(0, 10)
      }));
      
    } catch (err: any) {
      console.error("Analysis Failed:", err);
      const isQuotaError = err?.message?.includes('429') || err?.status === 'RESOURCE_EXHAUSTED';
      setError(isQuotaError 
        ? "System Quota Exhausted. Please wait 60s for neural engine reset." 
        : (err.message || "Operational Interruption. Check data integrity."));
      setIsProcessing(false);
      setShowTerminal(false);
    }
  };

  const handleSelectHistoryReport = (report: SavedReport) => {
    setAssessment(report.assessment);
    setInputData(report.data);
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} owners={registeredOwners} />;
  }

  return (
    <div className="min-h-screen text-slate-900 bg-white selection:bg-blue-100">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        lang={lang} 
        role={currentUser.role} 
        onLogout={handleLogout}
      />
      
      <main className="ml-64 p-8 lg:p-12 min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
              {currentUser.role === 'admin' ? 'MASTER CONTROL' : 'SECURE NODE'}
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 capitalize tracking-tight">
              {(TRANSLATIONS[lang] as any)[currentView] || currentView}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center space-x-2 text-slate-600"
            >
              <ICONS.Language size={14} />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{currentUser.businessName || 'Administrator'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm bg-slate-900 shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
            <span>System Alert: {error}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {showTerminal ? (
            <div className="max-w-2xl mx-auto py-20">
              <div className="text-center mb-8">
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Synthesizing Data...</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Historical Matrix Comparison In Progress</p>
              </div>
              <PythonTerminal steps={pythonSteps} onComplete={() => { setIsProcessing(false); setShowTerminal(false); setCurrentView('dashboard'); }} />
            </div>
          ) : (
            currentView === 'dashboard' ? (
              currentUser.role === 'admin' ? (
                <AdminDashboard 
                  owners={registeredOwners}
                  onAdd={handleAddOwner}
                  onRemove={handleRemoveOwner}
                  onUpdatePerms={handleUpdatePerms}
                />
              ) : (
                <Dashboard 
                  data={assessment} 
                  history={reportHistory[currentUser.id] || []} 
                  salesEntries={salesLogs[currentUser.id] || []}
                  onAddSalesEntry={handleAddSalesEntry}
                  lang={lang} 
                  onSelectReport={handleSelectHistoryReport} 
                />
              )
            ) : currentView === 'analyze' ? (
              <AnalysisForm onAnalyze={handleAnalyze} isLoading={isProcessing} userRole={currentUser.role} />
            ) : currentView === 'reports' ? (
              <Reports 
                history={reportHistory[currentUser.id] || []} 
                salesEntries={salesLogs[currentUser.id] || []}
                user={currentUser} 
                onSelectReport={handleSelectHistoryReport} 
              />
            ) : currentView === 'live' ? (
              <LiveFeed data={assessment} />
            ) : currentView === 'settings' ? (
              <Settings 
                user={currentUser} 
                onUpdate={handleUpdateProfile} 
              />
            ) : (
              <div className="bg-white p-20 rounded-[32px] text-center border border-slate-200 shadow-sm">
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Module Under Calibration</p>
              </div>
            )
          )}
        </div>
      </main>

      <SupportChatbot />
    </div>
  );
};

export default App;
