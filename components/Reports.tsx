
import React, { useMemo, useState } from 'react';
import { SavedReport, User, DailySalesEntry } from '../types';
import { ICONS } from '../constants';
import { generatePDFReport, generateMonthlyRevenueReport } from '../services/reportService';

interface ReportsProps {
  history: SavedReport[];
  salesEntries: DailySalesEntry[];
  user: User;
  onSelectReport: (report: SavedReport) => void;
}

const Reports: React.FC<ReportsProps> = ({ history, salesEntries, user, onSelectReport }) => {
  const [activeTab, setActiveTab] = useState<'papers' | 'sales'>('papers');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleDownload = async (report: SavedReport) => {
    setProcessingId(report.id);
    // Use timeout to allow UI to update before heavy PDF generation
    setTimeout(() => {
      try {
        generatePDFReport(user, report.data, report.assessment);
        setSuccessId(report.id);
        setTimeout(() => setSuccessId(null), 3000);
      } catch (err) {
        console.error("PDF Export failed", err);
      } finally {
        setProcessingId(null);
      }
    }, 300);
  };

  const monthlySummaries = useMemo(() => {
    const months: Record<string, DailySalesEntry[]> = {};
    salesEntries.forEach(entry => {
      const [year, month] = entry.date.split('-');
      const key = `${year}-${month}`;
      if (!months[key]) months[key] = [];
      months[key].push(entry);
    });
    return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  }, [salesEntries]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleDownloadMonthly = (key: string, entries: DailySalesEntry[]) => {
    setProcessingId(key);
    setTimeout(() => {
      try {
        const [year, monthIdx] = key.split('-');
        const monthName = monthNames[parseInt(monthIdx) - 1];
        generateMonthlyRevenueReport(user, monthName, year, entries);
        setSuccessId(key);
        setTimeout(() => setSuccessId(null), 3000);
      } catch (err) {
        console.error("Monthly log export failed", err);
      } finally {
        setProcessingId(null);
      }
    }, 300);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <ICONS.Reports size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Document Archive</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">SME Papers & Daily Revenue Reports</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('papers')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'papers' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Shop Papers
            </button>
            <button 
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Daily Logs
            </button>
          </div>
        </div>

        {activeTab === 'papers' ? (
          history.length > 0 ? (
            <div className="space-y-4">
              {history.map((report) => (
                <div 
                  key={report.id}
                  className="group p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-[8px] font-black text-slate-400 uppercase leading-none">PDF</span>
                      <span className="text-blue-600 mt-1">
                        {processingId === report.id ? (
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : successId === report.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <ICONS.Reports size={20} />
                        )}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <p className="text-sm font-black text-slate-900 tracking-tight uppercase">Analysis Cycle: {report.date.split(',')[0]}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Trust Score: <span className="text-slate-900">{report.assessment.creditScore}</span> | 
                        Risk Level: <span className="text-slate-900 uppercase">{report.assessment.riskRating}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleDownload(report)}
                      disabled={processingId === report.id}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-premium hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 ${
                        successId === report.id 
                          ? 'bg-emerald-500 text-white' 
                          : processingId === report.id 
                            ? 'bg-slate-200 text-slate-500' 
                            : 'bg-slate-900 text-white'
                      }`}
                    >
                      {processingId === report.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </>
                      ) : successId === report.id ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>Downloaded</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          <span>Download Paper</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyArchive label="Shop Papers" />
          )
        ) : (
          monthlySummaries.length > 0 ? (
            <div className="space-y-4">
              {monthlySummaries.map(([key, entries]) => {
                const [year, monthIdx] = key.split('-');
                const monthName = monthNames[parseInt(monthIdx) - 1];
                const total = entries.reduce((sum, e) => sum + e.amount, 0);
                
                return (
                  <div 
                    key={key}
                    className="group p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="text-[8px] font-black text-slate-400 uppercase leading-none">LOG</span>
                        <span className="text-emerald-600 mt-1">
                          {processingId === key ? (
                            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : successId === key ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <ICONS.Live size={20} />
                          )}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{monthName} {year} Revenue</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Total Logged: <span className="text-slate-900">INR {total.toLocaleString('en-IN')}</span> | 
                          Entries: <span className="text-slate-900">{entries.length}</span>
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDownloadMonthly(key, entries)}
                      disabled={processingId === key}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-premium hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 ${
                        successId === key 
                          ? 'bg-emerald-500 text-white' 
                          : processingId === key 
                            ? 'bg-slate-200 text-slate-500' 
                            : 'bg-slate-900 text-white'
                      }`}
                    >
                      {processingId === key ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Preparing...</span>
                        </>
                      ) : successId === key ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>Generated</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          <span>Download Monthly Report</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyArchive label="Monthly Logs" />
          )
        )}
      </div>
    </div>
  );
};

const EmptyArchive = ({ label }: { label: string }) => (
  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
      <ICONS.Reports size={32} />
    </div>
    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No {label} Found.</p>
    <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">Log your shop sales to generate reports.</p>
  </div>
);

export default Reports;
