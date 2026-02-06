
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ICONS } from '../constants';
import { AssessmentResult } from '../types';

interface LiveFeedProps {
  data: AssessmentResult | null;
}

const LiveFeed: React.FC<LiveFeedProps> = ({ data }) => {
  // Static dataset for the visual pulse, no longer oscillating money values.
  const [pulseData] = useState(() => Array.from({ length: 20 }, (_, i) => ({
    val: 45 + Math.sin(i * 0.5) * 5 + Math.random() * 2
  })));

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
          <ICONS.Live size={32} />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Tracker is Empty</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Please check your profits first to start using this tracker.</p>
      </div>
    );
  }

  const dailyVolume = (data.loanEligibility.eligibleAmount / 365);
  const monthlyVolume = (data.loanEligibility.eligibleAmount / 12);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Manual Entry Instruction Box */}
      <div className="p-8 bg-blue-50 border border-blue-200 rounded-[32px] flex items-center space-x-6">
         <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <ICONS.Plus size={24} />
         </div>
         <div>
            <h4 className="text-base font-black text-blue-900 uppercase tracking-tight mb-1">How to use this tracker:</h4>
            <p className="text-[11px] text-blue-700 font-bold uppercase tracking-widest leading-relaxed">
              Every day before you close your shop, please enter your total daily sales in the Dashboard. 
              This tracker reflects your institutional targets based on your latest assessment.
            </p>
         </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between overflow-hidden shadow-2xl relative">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Shop Counter Feed</span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            STATUS: <span className="text-white">STABLE ANALYSIS</span> | SOURCE: <span className="text-blue-400">INSTITUTIONAL GRADE DATA</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Tracker */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-soft relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Daily Sales Benchmark</h4>
            <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase">Institutional Goal</div>
          </div>
          <div className="flex items-baseline space-x-2 mb-4">
             <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter">₹{dailyVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calculated Daily Target</span>
          </div>
          <div className="h-24 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pulseData}>
                   <Line type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-8 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Daily Profit Margin</span>
             <span className="text-xs font-black text-slate-900">₹{(dailyVolume * 0.35).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Total Summary</h4>
            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">Monthly Target</div>
          </div>
          <div className="space-y-8">
             <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                   <span className="text-slate-400">Revenue Goal Target</span>
                   <span className="text-emerald-600">Calculated Projection</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Goal</p>
                   <p className="text-lg font-black text-slate-900">₹{(monthlyVolume/100000).toFixed(1)} Lakh</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected Margin</p>
                   <p className="text-lg font-black text-emerald-600">₹{(monthlyVolume * 0.3 / 1000).toFixed(0)}k</p>
                </div>
             </div>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
                Data generated from institutional credit parameters.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;
