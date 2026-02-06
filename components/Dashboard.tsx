import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Line, Legend } from 'recharts';
import { AssessmentResult, Language, SavedReport, DailySalesEntry } from '../types';
import { TRANSLATIONS, ICONS } from '../constants';

interface DashboardProps {
  data: AssessmentResult | null;
  history: SavedReport[];
  salesEntries: DailySalesEntry[];
  onAddSalesEntry: (entry: DailySalesEntry) => void;
  lang: Language;
  onSelectReport: (report: SavedReport) => void;
}

const REVENUE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                ₹{entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ data, history, salesEntries, onAddSalesEntry, lang }) => {
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
  };

  const [newSaleAmount, setNewSaleAmount] = useState<string>('');
  const [newSaleDate, setNewSaleDate] = useState<string>(getLocalDate());

  const [viewDate, setViewDate] = useState(new Date());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const monthTotal = useMemo(() => {
    const targetYear = viewDate.getFullYear();
    const targetMonth = viewDate.getMonth();
    return salesEntries
      .filter(e => {
        const [y, m] = e.date.split('-').map(Number);
        return y === targetYear && (m - 1) === targetMonth;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [viewDate, salesEntries]);

  const allTimeTotal = useMemo(() => {
    return salesEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [salesEntries]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaleAmount || isNaN(Number(newSaleAmount))) return;
    onAddSalesEntry({ date: newSaleDate, amount: Number(newSaleAmount) });
    setNewSaleAmount('');
  };

  const getStatusStyle = (score: number) => {
    if (score >= 850) return { label: 'Very Good', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 700) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (score >= 550) return { label: 'Average', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: 'Risky', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <div className="bg-white p-16 rounded-[48px] max-w-lg text-center border border-slate-200 shadow-soft">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <ICONS.Analyze size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">No Analysis Yet</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            Please click "Check My Profits" to see how your shop is doing and if you can get a loan.
          </p>
        </div>
      </div>
    );
  }

  const status = getStatusStyle(data.creditScore);
  const pieData = data.revenueBreakdown.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  const totalProjectedProfit = data.fiveYearForecast.reduce((sum, item) => sum + item.profit, 0);
  const dailyGoal = data.loanEligibility.eligibleAmount / 365;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Target & Sales Entry Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <ICONS.Live size={80} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Growth Milestone Target</span>
              </div>
              <div className="flex items-baseline space-x-3">
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">
                  ₹{dailyGoal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </h2>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Calculated Daily Target</span>
              </div>
            </div>

            <div className="mt-8">
              <form onSubmit={handleAddEntry} className="flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Date</label>
                  <input 
                    type="date" 
                    value={newSaleDate}
                    onChange={(e) => setNewSaleDate(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Enter Sales Amount</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5000"
                    value={newSaleAmount}
                    onChange={(e) => setNewSaleAmount(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  Log Daily Sale
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-soft flex flex-col justify-center gap-6">
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{monthNames[viewDate.getMonth()]} Sales</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{monthTotal.toLocaleString('en-IN')}</h3>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 uppercase">Self Reported</span>
            </div>
          </div>
          <div className="h-px bg-slate-100 w-full"></div>
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total All-Time Sales</p>
            <h3 className="text-xl font-black text-slate-600 tracking-tight">₹{allTimeTotal.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Borrowing Power & Eligibility Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Money You Can Borrow</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Credit Assessment</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
              <ICONS.Financial size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Maximum Credit Limit</p>
                <p className="text-3xl font-black tracking-tight">₹{(data.loanEligibility.eligibleAmount / 100000).toFixed(1)}L</p>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                   <ICONS.Financial size={80} />
                </div>
             </div>
             <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Interest Rate Bracket</p>
                <p className="text-2xl font-black text-slate-900">{data.loanEligibility.interestRateRange}</p>
                <p className="text-[8px] text-emerald-600 font-bold uppercase mt-1">Based on Risk: {data.riskRating}</p>
             </div>
             <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Propensity Score</p>
                <div className="flex items-baseline space-x-2">
                   <p className="text-3xl font-black text-slate-900">{data.loanEligibility.propensityScore}</p>
                   <span className="text-[9px] font-black text-slate-400 uppercase">/ 100</span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${data.loanEligibility.propensityScore}%` }}></div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Available Lending Partners</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.financialProducts.map((bank, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-colors shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-blue-600 text-xs border border-slate-100">
                        {bank.provider.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 tracking-tight">{bank.provider}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{bank.product}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-blue-600">{bank.rate}</p>
                       <p className="text-[7px] text-slate-400 font-bold uppercase">Estimated ROI</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Eligibility Criteria Side Panel */}
        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Eligibility Criteria Details</h4>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                 <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
                    <ICONS.Risk size={16} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-tight">Repayment Reliability</p>
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed mt-1">A Score of {data.creditScore} indicates high capability to service monthly EMI of approx. ₹{(data.loanEligibility.eligibleAmount * 0.03).toFixed(0)}.</p>
                 </div>
              </div>
              
              <div className="flex items-start space-x-4">
                 <div className="w-8 h-8 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ICONS.Chart size={16} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-tight">AI Strategy Insight</p>
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed mt-1">Based on current revenue, we suggest choosing a tenure that keeps EMI below 25% of monthly profits.</p>
                 </div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
             <p className="text-[9px] text-blue-400 font-bold italic leading-relaxed">
                *Eligibility parameters are dynamically adjusted based on sector benchmarks and your manual ledger entries.
             </p>
          </div>
        </div>
      </div>

      {/* Refined Bank Loan Tenure Details Section */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Bank Loan Tenure Details</h4>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">EMI vs. Interest Cost Trade-off Analysis</p>
          </div>
          <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
             <div className="flex items-center space-x-2 px-3 border-r border-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Monthly EMI</span>
             </div>
             <div className="flex items-center space-x-2 px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Total Interest</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Chart Area */}
          <div className="lg:col-span-2 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.loanEligibility.tenureOptions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight={800} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#2563eb" 
                  fontSize={10} 
                  fontWeight={800} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  label={{ value: 'EMI Amount', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 900, fill: '#2563eb' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981" 
                  fontSize={10} 
                  fontWeight={800} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  label={{ value: 'Total Interest', angle: 90, position: 'insideRight', fontSize: 10, fontWeight: 900, fill: '#10b981' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="estimatedEmi" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={40} name="Monthly EMI" />
                <Line yAxisId="right" type="monotone" dataKey="totalInterest" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} name="Total Interest" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Cards Area */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recommended Tenures</p>
            {data.loanEligibility.tenureOptions.map((option, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-3xl border transition-all duration-300 flex items-center justify-between ${
                  option.isEligible 
                  ? 'bg-slate-50 border-slate-100 hover:border-blue-300 hover:bg-white shadow-sm' 
                  : 'bg-slate-50/50 border-slate-100 opacity-60 grayscale'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-black text-slate-900">{option.label}</p>
                    {option.isEligible && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[7px] font-black uppercase tracking-widest">Eligible</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    Total Interest: <span className="text-emerald-600">₹{option.totalInterest.toLocaleString('en-IN')}</span>
                  </p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">EMI</p>
                   <p className="text-lg font-black text-slate-900 leading-none">₹{option.estimatedEmi.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-5 bg-slate-900 rounded-3xl text-white">
               <div className="flex items-center space-x-3 mb-3">
                  <ICONS.Analyze size={16} className="text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Auditor's Advice</p>
               </div>
               <p className="text-[11px] font-medium leading-relaxed opacity-80">
                  A longer tenure reduces your monthly EMI burden by {(((data.loanEligibility.tenureOptions[0]?.estimatedEmi - data.loanEligibility.tenureOptions[2]?.estimatedEmi) / data.loanEligibility.tenureOptions[0]?.estimatedEmi) * 100).toFixed(0)}%, giving you more cash-in-hand for daily operations.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Working Capital & Tax Integrity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Working Capital Optimization</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cash Flow & Liquidity Ratios</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ICONS.Financial size={20} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Working Capital</p>
              <p className="text-2xl font-black text-slate-900">₹{(data.workingCapitalMetrics.workingCapital / 1000).toFixed(0)}k</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Available for Operations</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Ratio</p>
              <p className="text-2xl font-black text-blue-600">{data.workingCapitalMetrics.currentRatio.toFixed(2)}</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Target Benchmark: 2.0</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Debt-to-Income</p>
              <p className="text-2xl font-black text-slate-900">{data.workingCapitalMetrics.debtToIncome.toFixed(2)}x</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">EMI Burden</p>
              <p className="text-2xl font-black text-rose-600">{data.workingCapitalMetrics.emiBurden}%</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">of monthly revenue</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10">
            <p className="text-[10px] font-bold text-blue-700 italic">
              {data.workingCapitalStatus}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black tracking-tight uppercase">Tax Integrity Monitor</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Compliance Matching AI</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
              data.taxIntegrity.status === 'Compliant' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {data.taxIntegrity.status}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Tax Slab</p>
                <p className="text-xl font-black">₹{data.taxIntegrity.expectedTax.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Actual Recorded</p>
                <p className="text-xl font-black text-blue-400">₹{data.taxIntegrity.actualPaid.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Health Advice</p>
              <p className="text-sm font-medium leading-relaxed opacity-80">{data.taxComplianceNotes}</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suggested Ledger Entries</p>
              <div className="space-y-3">
                {data.suggestedLedgerEntries.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="font-black text-white">{entry.category}</span>
                      <span className="text-slate-500 text-[9px]">{entry.description}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[8px] font-black uppercase">{entry.suggestedAccount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Benchmarking & Next 3 Months Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Industry Benchmarking</h4>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><ICONS.Chart size={20} /></div>
          </div>
          
          <div className="space-y-6">
            {data.benchmarks.map((bench, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-slate-500">{bench.metric}</span>
                  <span className={bench.status === 'Above' ? 'text-emerald-600' : 'text-rose-600'}>
                    {bench.status} Average
                  </span>
                </div>
                <div className="relative h-6 bg-slate-100 rounded-lg overflow-hidden flex items-center px-4">
                  <div 
                    className="absolute inset-y-0 left-0 bg-blue-600/20 border-r border-blue-600/30 transition-all duration-1000" 
                    style={{ width: `${(bench.businessValue / (bench.industryAverage * 1.5)) * 100}%` }}
                  ></div>
                  <div className="relative flex w-full justify-between items-center">
                    <span className="text-[10px] font-black text-slate-900">You: {bench.businessValue}%</span>
                    <span className="text-[10px] font-black text-slate-400">Industry: {bench.industryAverage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">3-Month Strategic Forecast</h4>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ICONS.Live size={20} /></div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.forecast} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} fontWeight={800} axisLine={false} tickLine={false} dy={5} />
                <YAxis stroke="#94a3b8" fontSize={9} fontWeight={800} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="projectedRevenue" stroke="#2563eb" fill="#2563eb10" strokeWidth={2} name="Sales" />
                <Area type="monotone" dataKey="projectedProfit" stroke="#10b981" fill="#10b98110" strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex justify-between gap-4">
            {data.forecast.map((f, i) => (
              <div key={i} className="flex-1 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{f.month}</p>
                <p className="text-sm font-black text-slate-900">₹{(f.projectedProfit / 1000).toFixed(0)}k</p>
                <p className="text-[7px] text-emerald-600 font-bold uppercase mt-0.5">Proj. Net</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid & Tax Safety Refined */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Trust Score</span>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${status.border} ${status.bg} ${status.color}`}>
              {status.label}
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{data.creditScore}</h3>
            <span className="text-slate-400 text-[9px] font-black uppercase">Points</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group/tax overflow-visible">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Safety Status</span>
            <div className="relative">
              <div className="p-1 bg-slate-50 text-slate-400 rounded-md cursor-help peer transition-colors hover:bg-slate-100">
                <ICONS.Help size={16} />
              </div>
              {/* Refined Tooltip */}
              <div className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-slate-900 text-white text-[10px] font-medium rounded-2xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-300 z-50 shadow-2xl pointer-events-none transform translate-y-2 peer-hover:translate-y-0">
                <div className="flex items-center space-x-2 mb-2 text-emerald-400">
                  <ICONS.Risk size={12} />
                  <span className="font-black uppercase tracking-widest">Compliance Audit Note</span>
                </div>
                <p className="leading-relaxed opacity-90">{data.taxComplianceNotes}</p>
                <div className="absolute top-full right-3.5 border-8 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <h3 className={`text-4xl font-extrabold tracking-tight ${data.complianceScore > 80 ? 'text-emerald-600' : data.complianceScore > 50 ? 'text-amber-500' : 'text-rose-600'}`}>
              {data.complianceScore}%
            </h3>
          </div>
          <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
             <div 
                className={`h-full transition-all duration-1000 ${data.complianceScore > 80 ? 'bg-emerald-500' : data.complianceScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                style={{ width: `${data.complianceScore}%` }}
             ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Health Note</p>
            <p className="text-sm font-bold text-slate-900 leading-relaxed">{data.workingCapitalStatus}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;