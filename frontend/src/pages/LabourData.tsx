import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchLabourData, fetchFilters } from '../api';
import { 
  Database, Search, Download, Filter, ChevronLeft, ChevronRight, 
  ArrowUpDown, X, CheckCircle2, MapPin, Briefcase
} from 'lucide-react';
import { cn } from '../Layout';

export default function LabourData() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<{ states: string[], sectors: string[], districts: string[], skills: string[] }>({ 
    states: [], sectors: [], districts: [], skills: [] 
  });
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [searchQuery, setSearchQuery] = useState(queryParam);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters().then(setFilters);
  }, []);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    setLoading(true);
    fetchLabourData({ 
      state: selectedState, 
      sector: selectedSector, 
      skill: selectedSkill, 
      page: page, 
      limit: pageSize 
    }).then(res => {
      setData(res.data);
      setTotalCount(res.total_count);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedState, selectedSector, selectedSkill, page, pageSize]);

  // Client-side quick filter for real-time responsiveness
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(r => 
      r.skill?.toLowerCase().includes(q) ||
      r.job_role?.toLowerCase().includes(q) ||
      r.district?.toLowerCase().includes(q) ||
      r.sector?.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handleExportCSV = () => {
    const headers = ['Month', 'State', 'District', 'Sector', 'Job Role', 'Skill', 'Demand', 'Supply'];
    const rows = filteredData.map(r => [
      r.month,
      `"${r.state}"`,
      `"${r.district}"`,
      `"${r.sector}"`,
      `"${r.job_role}"`,
      `"${r.skill}"`,
      r.demand_count,
      r.supply_count
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skillsight_raw_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in flex flex-col h-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <Database size={13} className="text-brand-600" />
              Raw Workforce Microdata
            </span>
            <span className="text-xs text-slate-400">Total Observations: {totalCount.toLocaleString()}</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Labour Market Census & Job Postings Microdata
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query, filter, and inspect granular employment postings and graduate pipelines
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
        >
          <Download size={14} /> Export Filtered Records
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            value={selectedState} 
            onChange={(e) => { setSelectedState(e.target.value); setPage(1); }}
          >
            <option value="">All States ({filters.states.length})</option>
            {filters.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            value={selectedSector} 
            onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }}
          >
            <option value="">All Sectors ({filters.sectors.length})</option>
            {filters.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm max-w-[180px] truncate"
            value={selectedSkill} 
            onChange={(e) => { setSelectedSkill(e.target.value); setPage(1); }}
          >
            <option value="">All Skills ({filters.skills.length})</option>
            {filters.skills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {(selectedState || selectedSector || selectedSkill) && (
            <button
              onClick={() => { setSelectedState(''); setSelectedSector(''); setSelectedSkill(''); setPage(1); }}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 rounded-xl transition-colors border border-rose-200 inline-flex items-center gap-1"
            >
              <X size={13} /> Reset
            </button>
          )}
        </div>

        {/* Real-time search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role, skill, district..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Main Microdata Table */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/90 overflow-hidden flex-1 flex flex-col">
        <div className="p-3.5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Showing <span className="font-bold text-slate-900">{filteredData.length}</span> of {totalCount.toLocaleString()} observations
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Validated Prototype Dataset
          </span>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200/80 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3.5 font-bold">Period</th>
                <th className="px-5 py-3.5 font-bold">Administrative Zone</th>
                <th className="px-5 py-3.5 font-bold">Industrial Domain & Role</th>
                <th className="px-5 py-3.5 font-bold">Specialization Skill</th>
                <th className="px-5 py-3.5 font-bold text-right">Demand</th>
                <th className="px-5 py-3.5 font-bold text-right">Supply</th>
                <th className="px-5 py-3.5 font-bold text-right">Net Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading records from database...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => {
                  const netGap = (row.demand_count || 0) - (row.supply_count || 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-500 font-medium">
                        {row.month}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <MapPin size={12} className="text-brand-500 shrink-0" />
                          <span>{row.district}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{row.state}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{row.job_role}</div>
                        <div className="text-[10px] text-slate-500">{row.sector}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-brand-700">
                        {row.skill}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                        {row.demand_count?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                        {row.supply_count?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={cn(
                          "font-mono font-bold text-xs px-2 py-0.5 rounded",
                          netGap > 0 ? "text-rose-700 bg-rose-50" : "text-emerald-700 bg-emerald-50"
                        )}>
                          {netGap > 0 ? `+${netGap.toLocaleString()}` : netGap.toLocaleString()}
                        </span>
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
            <span>Page {page} of {totalPages}</span>
            <span className="text-slate-300">|</span>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-semibold text-slate-700">{page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
