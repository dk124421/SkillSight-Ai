import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSkillDemand, fetchFilters } from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { 
  BarChart2, Search, Filter, TrendingUp, BookOpen, Layers, CheckCircle2, 
  ArrowUpRight, AlertTriangle, ArrowUpDown, X, Sparkles
} from 'lucide-react';
import { cn } from '../Layout';

export default function SkillDemand() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ states: string[], sectors: string[] }>({ states: [], sectors: [] });
  const [selectedState, setSelectedState] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'comparison' | 'gap'>('comparison');
  const [displayLimit, setDisplayLimit] = useState<number>(15);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters().then(setFilters);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchSkillDemand({ state: selectedState, sector: selectedSector })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedState, selectedSector]);

  // Filter and slice data for display
  const processedData = useMemo(() => {
    let result = [...data];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.skill?.toLowerCase().includes(q));
    }

    // Add calculated gap
    result = result.map(item => ({
      ...item,
      net_gap: (item.demand_count || 0) - (item.supply_count || 0)
    }));

    if (viewMode === 'gap') {
      result.sort((a, b) => b.net_gap - a.net_gap);
    } else {
      result.sort((a, b) => b.demand_count - a.demand_count);
    }

    return result.slice(0, displayLimit);
  }, [data, searchQuery, viewMode, displayLimit]);

  // Aggregate stats
  const apexSkill = data[0];
  const highestDeficitSkill = useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => ((b.demand_count - b.supply_count) - (a.demand_count - a.supply_count)))[0];
  }, [data]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in flex flex-col h-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <BarChart2 size={13} className="text-brand-600" />
              Specialization Demand Telemetry
            </span>
            <span className="text-xs text-slate-400">Aggregated from verified portals</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Skill Demand vs Supply Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate enterprise demand volume against institutional workforce output across key sectors
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">All States ({filters.states.length})</option>
            {filters.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            value={selectedSector} 
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            <option value="">All Sectors ({filters.sectors.length})</option>
            {filters.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {(selectedState || selectedSector) && (
            <button
              onClick={() => { setSelectedState(''); setSelectedSector(''); }}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
              title="Reset Filters"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Demanded Specialization</span>
          <p className="text-xl font-bold font-display text-slate-900 mt-1 truncate">
            {apexSkill?.skill || 'N/A'}
          </p>
          <span className="text-xs font-semibold text-brand-600">
            {apexSkill?.demand_count?.toLocaleString()} verified openings
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Steepest Gross Shortage</span>
          <p className="text-xl font-bold font-display text-rose-600 mt-1 truncate">
            {highestDeficitSkill?.skill || 'N/A'}
          </p>
          <span className="text-xs font-semibold text-rose-700">
            +{((highestDeficitSkill?.demand_count || 0) - (highestDeficitSkill?.supply_count || 0)).toLocaleString()} deficit gap
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sample Coverage</span>
          <p className="text-xl font-bold font-display text-slate-900 mt-1">
            {data.length} Specializations Indexed
          </p>
          <span className="text-xs text-slate-500">
            Cross-industry validation complete
          </span>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex-1 flex flex-col">
        {/* Chart View Controls & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('comparison')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all",
                viewMode === 'comparison' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Demand vs Supply
            </button>
            <button
              onClick={() => setViewMode('gap')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all",
                viewMode === 'gap' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Net Deficit Ranking
            </button>
          </div>

          {/* Search & Limit Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills in chart..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
              <span>Show:</span>
              <select
                value={displayLimit}
                onChange={(e) => setDisplayLimit(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={25}>Top 25</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recharts Horizontal Visual */}
        <div className="flex-1 min-h-[480px] w-full mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              Loading specialization metrics...
            </div>
          ) : processedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              No skills match the current search filters.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={processedData} 
                layout="vertical" 
                margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  dataKey="skill" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={140} 
                  tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 6 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-teal-300 text-sm">{item.skill}</p>
                          <p className="text-slate-300">
                            Demand: <span className="font-bold text-white">{item.demand_count?.toLocaleString()}</span>
                          </p>
                          <p className="text-slate-300">
                            Supply: <span className="font-bold text-white">{item.supply_count?.toLocaleString()}</span>
                          </p>
                          <p className="text-rose-300 font-bold">
                            Net Deficit: +{item.net_gap?.toLocaleString()}
                          </p>
                          <div className="pt-2 mt-2 border-t border-slate-700/80 flex gap-2">
                            <span className="text-[10px] text-brand-300">💡 Click actions below to inspect</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                
                {viewMode === 'comparison' ? (
                  <>
                    <Bar 
                      dataKey="demand_count" 
                      name="Active Demand" 
                      fill="#4F46E5" 
                      radius={[0, 4, 4, 0]} 
                      barSize={14} 
                    />
                    <Bar 
                      dataKey="supply_count" 
                      name="Workforce Supply" 
                      fill="#94A3B8" 
                      radius={[0, 4, 4, 0]} 
                      barSize={14} 
                    />
                  </>
                ) : (
                  <Bar 
                    dataKey="net_gap" 
                    name="Net Deficit Shortfall" 
                    fill="#EF4444" 
                    radius={[0, 6, 6, 0]} 
                    barSize={20}
                  >
                    {processedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.net_gap > 20000 ? '#DC2626' : entry.net_gap > 10000 ? '#F97316' : '#4F46E5'} 
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
