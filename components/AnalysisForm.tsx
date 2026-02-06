
import React, { useState, useRef } from 'react';
import { FinancialData, Industry, UserRole } from '../types';
import { ICONS } from '../constants';
import { parseFinancialCSV } from '../services/fileParser';

interface AnalysisFormProps {
  onAnalyze: (data: FinancialData) => void;
  isLoading: boolean;
  userRole: UserRole;
}

const industries: Industry[] = ['Manufacturing', 'Retail', 'Agriculture', 'Services', 'Logistics', 'E-commerce'];

const MOCK_BANKS = [
  { id: 'hfdc', name: 'HDFC Bank', logo: 'H', balance: 450200, revenue: 1200000 },
  { id: 'icici', name: 'ICICI Bank', logo: 'I', balance: 125000, revenue: 350000 },
  { id: 'sbi', name: 'State Bank of India', logo: 'S', balance: 89000, revenue: 150000 },
  { id: 'axis', name: 'Axis Bank', logo: 'A', balance: 32000, revenue: 80000 },
];

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalyze, isLoading, userRole }) => {
  const [formData, setFormData] = useState<FinancialData>({
    revenue: 500000,
    expenses: 300000,
    accountsReceivable: 50000,
    accountsPayable: 20000,
    inventory: 100000,
    loans: 0,
    cashInHand: 40000,
    industry: 'Retail',
    gstStatus: 'Pending',
    bankBalance: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [syncStatus, setSyncStatus] = useState<{gst: string, bank: string}>({gst: '', bank: ''});
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [isAggregating, setIsAggregating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.revenue < 0) newErrors.revenue = "Revenue cannot be negative";
    if (formData.expenses < 0) newErrors.expenses = "Expenses cannot be negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'industry' || name === 'gstStatus') ? value : Number(value)
    }));
  };

  const handleSyncGST = async () => {
    setSyncStatus(prev => ({...prev, gst: 'Syncing...'}));
    await new Promise(r => setTimeout(r, 1500));
    setFormData(prev => ({...prev, gstStatus: 'Filed'}));
    setSyncStatus(prev => ({...prev, gst: 'GST Sync Complete'}));
    setTimeout(() => setSyncStatus(prev => ({...prev, gst: ''})), 3000);
  };

  const handleOpenBanking = () => {
    setShowBankModal(true);
  };

  const toggleBank = (id: string) => {
    setSelectedBanks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const performAggregation = async () => {
    if (selectedBanks.length === 0) return;
    setIsAggregating(true);
    await new Promise(r => setTimeout(r, 2000));
    
    const aggregated = MOCK_BANKS
      .filter(b => selectedBanks.includes(b.id))
      .reduce((acc, curr) => ({
        balance: acc.balance + curr.balance,
        revenue: acc.revenue + curr.revenue
      }), { balance: 0, revenue: 0 });

    setFormData(prev => ({ 
      ...prev, 
      bankBalance: aggregated.balance, 
      revenue: aggregated.revenue 
    }));
    
    setIsAggregating(false);
    setShowBankModal(false);
    setSyncStatus(prev => ({...prev, bank: 'Open Banking Linked'}));
    setTimeout(() => setSyncStatus(prev => ({...prev, bank: ''})), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onAnalyze(formData);
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={handleSyncGST}
          disabled={!!syncStatus.gst}
          className="p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-blue-500 transition-all shadow-sm group"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
            <ICONS.Reports size={20} />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">GST Return Import</h4>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{syncStatus.gst || 'Authenticate & Sync'}</p>
        </button>

        <button 
          onClick={handleOpenBanking}
          disabled={!!syncStatus.bank}
          className="p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-emerald-500 transition-all shadow-sm"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 border border-emerald-100">
            <ICONS.Financial size={20} />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Live Bank Sync</h4>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{syncStatus.bank || 'Open Banking Connect'}</p>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-amber-500 transition-all shadow-sm"
        >
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 border border-amber-100">
            <ICONS.Analyze size={20} />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Manual Import</h4>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">CSV / XLSX / PDF Parsing</p>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.pdf" />
        </button>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Segmentation</label>
              <select name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Revenue (₹)</label>
              <input type="number" name="revenue" value={formData.revenue} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-900 font-black outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operating Expenses (₹)</label>
              <input type="number" name="expenses" value={formData.expenses} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-900 font-black outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div className="grid grid-cols-3 gap-4 md:col-span-2">
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Receivables</label>
                 <input type="number" name="accountsReceivable" value={formData.accountsReceivable} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold" />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory</label>
                 <input type="number" name="inventory" value={formData.inventory} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold" />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payables</label>
                 <input type="number" name="accountsPayable" value={formData.accountsPayable} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold" />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outstanding Debt (₹)</label>
              <input type="number" name="loans" value={formData.loans} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-900 font-black outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Bank Balance (₹)</label>
              <input type="number" name="bankBalance" value={formData.bankBalance} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-slate-900 font-black outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          <div className="pt-8 flex flex-col items-center">
            <button
              type="submit"
              disabled={isLoading}
              className="px-16 py-5 bg-slate-900 rounded-full font-black text-white uppercase tracking-[0.3em] shadow-premium hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs"
            >
              {isLoading ? 'Calibrating Strategic Models...' : 'Execute Analysis Cycle'}
            </button>
            <p className="mt-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Encrypted Data Transmission Active (HTTPS/SSL)</p>
          </div>
        </form>
      </div>

      {showBankModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 active-gradient flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">Institution Connector</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Select Accounts for Aggregation</p>
              </div>
              <button onClick={() => setShowBankModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                {MOCK_BANKS.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => toggleBank(bank.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      selectedBanks.includes(bank.id) 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-900 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${selectedBanks.includes(bank.id) ? 'bg-white/10' : 'bg-slate-100'}`}>{bank.logo}</div>
                      <div className="text-left">
                        <p className="text-xs font-extrabold">{bank.name}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${selectedBanks.includes(bank.id) ? 'text-slate-400' : 'text-slate-500'}`}>Institutional Access</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-black text-slate-900">{selectedBanks.length} Selected</p>
              <button
                onClick={performAggregation}
                disabled={selectedBanks.length === 0 || isAggregating}
                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isAggregating ? 'Syncing...' : 'Link & Aggregate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisForm;
