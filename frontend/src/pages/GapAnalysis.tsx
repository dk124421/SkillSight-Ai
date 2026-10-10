import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGapAnalysis, fetchFilters } from '../api';
import { 
  AlertCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, Download, 
  ExternalLink, TrendingUp, BookOpen, CheckCircle, Filter, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../Layout';

type SortField = 'skill' | 'demand_count' | 'supply_count' | 'gap' | 'gap_percentage';

export default function GapAnalysis() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ states: string[], districts: string[] }>({ states: [], districts: [] });
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('gap');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters().then(setFilters);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchGapAnalysis({ state: selectedState, district: selectedDistrict })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedState, selectedDistrict]);

  // Filter & Sort Pipeline
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Severity filter
    if (severityFilter !== 'All') {
      result = result.filter((row) => row.severity === severityFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) => row.skill?.toLowerCase().includes(q));
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, severityFilter, searchQuery, sortField, sortAsc]);

  // Pagination slice
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for metrics
    }
  };

  // High-level KPI aggregations
  const totalSkillsCount = data.length;
  const highSeverityCount = data.filter((d) => d.severity === 'High').length;
  const totalNetShortage = data.reduce((acc, curr) => acc + (curr.gap > 0 ? curr.gap : 0), 0);
  const avgGapPct = data.length 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.gap_percentage || 0), 0) / data.length)
    : 0;

  const exportCSV = () => {
    const headers = ['Skill', 'Demand', 'Supply', 'Net Shortage', 'Gap Percentage', 'Severity'];
    const rows = filteredAndSortedData.map(r => [
      `"${r.skill}"`,
      r.demand_count,
      r.supply_count,
      r.gap,
      `${r.gap_percentage?.toFixed(1)}%`,
      r.severity
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skillsight_gap_analysis_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in flex flex-col h-full">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle size={13} className="text-rose-600" />
              Supply vs Demand Deficit Diagnostic
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Workforce Supply-Demand Gap Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify critical shortfall bottlenecks, surplus specializations, and intervention priority levels
          </p>
        </div>

        {/* Filters and CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            value={selectedState} 
            onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All States ({filters.states.length})</option>
            {filters.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            value={selectedDistrict} 
            onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Districts ({filters.districts.length})</option>
            {filters.districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <button
            onClick={exportCSV}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Aggregates */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tracked Skills</p>
          <p className="text-2xl font-extrabold font-display text-slate-900 mt-1">{totalSkillsCount}</p>
          <span className="text-[11px] text-slate-500">Across current scope</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Critical Shortages</p>
          <p className="text-2xl font-extrabold font-display text-rose-600 mt-1">{highSeverityCount}</p>
          <span className="text-[11px] text-rose-600 font-semibold">&gt;30% unmet demand</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Worker Deficit</p>
          <p className="text-2xl font-extrabold font-display text-slate-900 mt-1">
            {totalNetShortage.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Unfulfilled positions</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Gap Ratio</p>
          <p className="text-2xl font-extrabold font-display text-brand-600 mt-1">{avgGapPct}%</p>
          <span className="text-[11px] text-slate-500">Deficit intensity</span>
        </div>
      </div>

      {/* Table Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'High', 'Medium', 'Low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => { setSeverityFilter(sev); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                severityFilter === sev
                  ? sev === 'High' ? "bg-rose-600 text-white shadow-sm" :
                    sev === 'Medium' ? "bg-amber-600 text-white shadow-sm" :
                    sev === 'Low' ? "bg-emerald-600 text-white shadow-sm" :
                    "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              )}
            >
              {sev === 'All' ? 'All Severities' : `${sev} Severity`}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search skill title..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/90 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200/80 sticky top-0 z-10">
              <tr>
                <th 
                  onClick={() => handleSort('skill')}
                  className="px-6 py-4 font-bold cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Specialization Skill</span>
                    {sortField === 'skill' ? (
                      sortAsc ? <ArrowUp size={13} className="text-brand-600" /> : <ArrowDown size={13} className="text-brand-600" />
                    ) : <ArrowUpDown size={12} className="text-slate-400 opacity-60" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('demand_count')}
                  className="px-6 py-4 font-bold text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Est. Demand</span>
                    {sortField === 'demand_count' ? (
                      sortAsc ? <ArrowUp size={13} className="text-brand-600" /> : <ArrowDown size={13} className="text-brand-600" />
                    ) : <ArrowUpDown size={12} className="text-slate-400 opacity-60" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('supply_count')}
                  className="px-6 py-4 font-bold text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Est. Supply</span>
                    {sortField === 'supply_count' ? (
                      sortAsc ? <ArrowUp size={13} className="text-brand-600" /> : <ArrowDown size={13} className="text-brand-600" />
                    ) : <ArrowUpDown size={12} className="text-slate-400 opacity-60" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('gap')}
                  className="px-6 py-4 font-bold text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Net Deficit</span>
                    {sortField === 'gap' ? (
                      sortAsc ? <ArrowUp size={13} className="text-brand-600" /> : <ArrowDown size={13} className="text-brand-600" />
                    ) : <ArrowUpDown size={12} className="text-slate-400 opacity-60" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('gap_percentage')}
                  className="px-6 py-4 font-bold text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Gap % & Equilibrium Bar</span>
                    {sortField === 'gap_percentage' ? (
                      sortAsc ? <ArrowUp size={13} className="text-brand-600" /> : <ArrowDown size={13} className="text-brand-600" />
                    ) : <ArrowUpDown size={12} className="text-slate-400 opacity-60" />}
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-center">Severity</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading gap telemetry...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No skills found matching current search and filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const supplyRatio = row.demand_count > 0 
                    ? Math.min(100, Math.round((row.supply_count / row.demand_count) * 100))
                    : 100;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-500 opacity-60"></span>
                          <span>{row.skill}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        {row.demand_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        {row.supply_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "font-bold font-mono px-2 py-0.5 rounded text-xs",
                          row.gap > 0 ? "text-rose-700 bg-rose-50" : "text-emerald-700 bg-emerald-50"
                        )}>
                          {row.gap > 0 ? `+${row.gap.toLocaleString()}` : row.gap.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="font-bold font-mono text-slate-700 min-w-[45px]">
                            {row.gap_percentage > 0 ? `${row.gap_percentage.toFixed(1)}%` : '0%'}
                          </span>
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden flex" title={`${supplyRatio}% supply fulfilled`}>
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                supplyRatio < 70 ? "bg-rose-500" : supplyRatio < 90 ? "bg-amber-500" : "bg-emerald-500"
                              )}
                              style={{ width: `${supplyRatio}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                          row.severity === 'High' ? "bg-rose-50 text-rose-700 border-rose-200" :
                          row.severity === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}>
                          {row.severity === 'High' && <AlertCircle size={11} className="mr-1" />}
                          {row.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/forecasting?skill=${encodeURIComponent(row.skill)}`)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Forecast Skill"
                          >
                            <TrendingUp size={14} />
                          </button>
                          <button
                            onClick={() => navigate(`/training?skill=${encodeURIComponent(row.skill)}`)}
                            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Training Courses"
                          >
                            <BookOpen size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Showing {paginatedData.length} of {filteredAndSortedData.length} records</span>
            <span className="text-slate-300">|</span>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
