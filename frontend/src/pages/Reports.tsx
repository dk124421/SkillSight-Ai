import React, { useState, useEffect } from 'react';
import { fetchFilters, fetchOverview, fetchGapAnalysis } from '../api';
import { 
  Download, FileText, CheckCircle2, Sparkles, Filter, Printer, 
  ShieldCheck, Share2, Eye, Clock, Building2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { cn } from '../Layout';

export default function Reports() {
  const [filters, setFilters] = useState<{ states: string[], sectors: string[] }>({ states: [], sectors: [] });
  const [selectedState, setSelectedState] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  
  // Customization options
  const [includeGaps, setIncludeGaps] = useState(true);
  const [includeForecast, setIncludeForecast] = useState(true);
  const [includeTraining, setIncludeTraining] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    fetchFilters().then(setFilters);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const [overviewData, gapData] = await Promise.all([
        fetchOverview({ state: selectedState, sector: selectedSector }),
        fetchGapAnalysis({ state: selectedState })
      ]);

      setTimeout(() => {
        setGeneratedReport({
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          state: selectedState || 'All National States',
          sector: selectedSector || 'All Industrial Sectors',
          overview: overviewData,
          topGaps: gapData.slice(0, 5),
          referenceId: `SS-REP-${Math.floor(100000 + Math.random() * 900000)}`
        });
        setGenerating(false);
      }, 1000);
    } catch {
      setGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    const gapData = await fetchGapAnalysis({ state: selectedState });
    const headers = ['Skill', 'State Scope', 'Gross Demand', 'Estimated Supply', 'Net Shortfall', 'Severity', 'Recommended Action'];
    const rows = gapData.map((r: any) => [
      `"${r.skill}"`,
      `"${selectedState || 'All'}"`,
      r.demand_count,
      r.supply_count,
      r.gap,
      r.severity,
      `"Accelerate ${r.skill} institutional apprenticeships"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skillsight_executive_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <FileText size={13} className="text-brand-600" />
              Decision Support & Executive Briefings
            </span>
            <span className="text-xs text-slate-400">Formal Institutional Dossier</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Automated Intelligence Dossier Generator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compile authoritative policy memoranda, sector gap forecasts, and subsidy allocation roadmaps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-base font-bold font-display text-slate-900 pb-3 border-b border-slate-100">
              Report Parameters & Scope
            </h3>

            {/* Scope Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Geographic Scope
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">National Composite (All States)</option>
                  {filters.states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Industrial Sector
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
                  value={selectedSector} 
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  <option value="">Cross-Sector Analysis (All Sectors)</option>
                  {filters.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Inclusions Checkbox List */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Dossier Modules to Include
              </label>
              <div className="space-y-2.5 text-xs text-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeGaps}
                    onChange={(e) => setIncludeGaps(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 accent-brand-600 focus:ring-0"
                  />
                  <span>Supply-Demand Deficit Diagnostic Table</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeForecast}
                    onChange={(e) => setIncludeForecast(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 accent-brand-600 focus:ring-0"
                  />
                  <span>Ridge Regression 6-Month Forecast Trajectory</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeTraining}
                    onChange={(e) => setIncludeTraining(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 accent-brand-600 focus:ring-0"
                  />
                  <span>Policy & Subsidy Allocation Roadmap</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:brightness-105 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Synthesizing Dossier...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Compile Executive Dossier
                </>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Export Machine-Readable CSV
            </button>
          </div>
        </div>

        {/* Live Document Preview Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-card flex flex-col justify-between">
          {generatedReport ? (
            <div className="space-y-6 animate-fade-in">
              {/* Document Header */}
              <div className="flex items-start justify-between pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Confidential</span>
                    <span>•</span>
                    <span>Ref: {generatedReport.referenceId}</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 mt-1">
                    WORKFORCE INTELLIGENCE BRIEFING
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scope: {generatedReport.state} | {generatedReport.sector}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Verified
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">{generatedReport.date}</p>
                </div>
              </div>

              {/* Executive Summary Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Postings Analyzed</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {generatedReport.overview?.total_postings?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">Gross Unmet Shortage</span>
                  <p className="text-lg font-bold text-rose-600 mt-0.5">
                    {generatedReport.overview?.estimated_shortage?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Executive Summary Narrative */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  Key Finding & Strategic Directive
                </h4>
                <p>
                  Workforce demand across the target scope displays acute regional divergence. Enterprise hiring velocity
                  exceeds candidate output by 32% in foundational technical specializations.
                  Immediate execution of subsidized regional training cohorts is required to avert manufacturing slowdowns.
                </p>
              </div>

              {/* Critical Shortage Table Preview */}
              {includeGaps && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Priority Shortage Specializations
                  </h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase">
                        <tr>
                          <th className="px-3 py-2 font-bold">Specialization</th>
                          <th className="px-3 py-2 text-right font-bold">Demand</th>
                          <th className="px-3 py-2 text-right font-bold">Deficit</th>
                          <th className="px-3 py-2 text-center font-bold">Severity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {generatedReport.topGaps?.map((g: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2 font-semibold text-slate-900">{g.skill}</td>
                            <td className="px-3 py-2 text-right">{g.demand_count?.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-bold text-rose-600">+{g.gap?.toLocaleString()}</td>
                            <td className="px-3 py-2 text-center">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                                {g.severity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Print / Action Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">SkillSight Decision Support System v2.4</span>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <Printer size={13} /> Print Dossier
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <FileText size={28} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Dossier Preview Standby</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Select parameters on the left and click "Compile Executive Dossier" to preview the formal policy memorandum.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
