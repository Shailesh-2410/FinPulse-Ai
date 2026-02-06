
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';

interface TerminalProps {
  steps: string[];
  onComplete: () => void;
}

const HUMAN_FRIENDLY_STEPS = [
  "Synchronizing with GSTN Repositories...",
  "Authenticating Institutional API Handshake...",
  "Applying Linear Regression Forecasting Models...",
  "Validating Industry Sector Benchmarks...",
  "Calculating Net Working Capital Ratios...",
  "Auditing Tax Integrity and Slabs...",
  "Generating Creditworthiness Scorecard...",
  "Optimizing Loan Propensity Algorithms...",
  "Finalizing Strategic Growth Insights...",
  "Synthesizing High-Performance Analysis Cycle..."
];

const PythonTerminal: React.FC<TerminalProps> = ({ steps, onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalSteps = HUMAN_FRIENDLY_STEPS.length;
    if (currentStepIdx < totalSteps) {
      const timer = setTimeout(() => {
        setCurrentStepIdx(prev => prev + 1);
        setProgress(((currentStepIdx + 1) / totalSteps) * 100);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 1200);
    }
  }, [currentStepIdx, onComplete]);

  return (
    <div className="relative py-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="max-w-md mx-auto text-center space-y-10">
        {/* Animated AI Core */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-[ping_3s_infinite]"></div>
          <div className="absolute inset-2 rounded-full border-4 border-blue-50 animate-[spin_4s_linear_infinite]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[32px] shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white transform rotate-45 group">
              <div className="-rotate-45 animate-pulse">
                <ICONS.Analyze size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 animate-pulse">AI Engine Engaged</span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight h-8">
              {HUMAN_FRIENDLY_STEPS[currentStepIdx] || "Optimization Complete"}
            </h3>
          </div>
          
          {/* Progress Visual */}
          <div className="space-y-2 px-8">
            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span>Analysis Progress</span>
              <span className="text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mini Terminal Sub-logs (Secondary Visual) */}
        <div className="bg-slate-950/5 p-4 rounded-2xl border border-slate-100 max-w-sm mx-auto">
          <p className="text-[9px] font-mono text-slate-400 text-left">
            <span className="text-blue-500 mr-2">$</span>
            exec kernel.finance_v3 --tier=enterprise
            <br />
            <span className="text-slate-300">>> mem_sync: 100% | volatile_cache: cleared</span>
            <br />
            <span className="text-emerald-500">>> auth_token: 0x8a...F2 [VERIFIED]</span>
          </p>
        </div>
      </div>

      {/* Background Decorative Scanners */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-[shimmer_2s_infinite]"></div>
    </div>
  );
};

export default PythonTerminal;
