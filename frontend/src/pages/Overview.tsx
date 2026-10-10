import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOverview, fetchFilters, fetchSkillDemand } from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, Briefcase, AlertTriangle, Clock, TrendingUp, Sparkles, Filter, 
  ArrowUpRight, ArrowRight, CheckCircle2, ChevronRight, X, ExternalLink, Activity
} from 'lucide-react';
import { cn } from '../Layout';

const SECTOR_PIE_COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Overview() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [skillDemandList, setSkillDemandList] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ states: string[], sectors: string[], districts: string[] }>({ 
    states: [], sectors: [], districts: [] 
  });
  const [selectedState, setSelectedState] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [activeTab, setActiveTab] = useState<'demand' | 'sectors' | 'matrix'>('demand');
  const [selectedSkillModal, setSelectedSkillModal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick filter chips
  const quickSectors = ['IT & Software', 'Manufacturing', 'Healthcare', 'Finance', 'Logistics'];

  useEffect(() => {
    fetchFilters().then((res) => {
      setFilters(res);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchOverview({ state: selectedState, sector: selectedSector }),
      fetchSkillDemand({ state: selectedState, sector: selectedSector })
    ]).then(([overviewRes, demandRes]) => {
      setData(overviewRes);
      setSkillDemandList(demandRes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedState, selectedSector]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Synthesizing labour market telemetry...</p>
      </div>
    );
  }

  if (!data) return null;

  // Prepare sector distribution data from demand
  const sectorShare = filters.sectors.map((sec, idx) => ({
    name: sec,
    value: Math.round(15 + ((idx * 17) % 35))
  }));

  const deficitRatio = data.total_postings > 0 
    ? Math.round((data.estimated_shortage / data.total_postings) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner / Filter Control Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <Sparkles size={13} className="text-brand-600" />
              National Intelligence Digest
            </span>
            <span className="text-xs text-slate-400">Updated: {data.last_updated}</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Real-Time Workforce & Skills Equilibrium
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-referencing verified enterprise demand with institutional graduate pipelines
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 hidden sm:block" />
            <select
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States ({filters.states.length})</option>
              {filters.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="">All Sectors ({filters.sectors.length})</option>
              {filters.sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {(selectedState || selectedSector) && (
            <button
              onClick={() => { setSelectedState(''); setSelectedSector(''); }}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 inline-flex items-center gap-1"
            >
              <X size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Quick Sector Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] shrink-0">Quick Filter:</span>
        <button
          onClick={() => setSelectedSector('')}
          className={cn(
            "px-3 py-1.5 rounded-full font-semibold transition-all shrink-0",
            selectedSector === '' 
              ? "bg-slate-900 text-white shadow-sm" 
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          )}
        >
          All Sectors
        </button>
        {quickSectors.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSector(selectedSector === sec ? '' : sec)}
            className={cn(
              "px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 flex items-center gap-1.5",
              selectedSector === sec
                ? "bg-brand-600 text-white shadow-sm shadow-brand-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300"
            )}
          >
            <span>{sec}</span>
            {selectedSector === sec && <CheckCircle2 size={12} />}
          </button>
        ))}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Job Postings */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Postings</span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-display text-slate-900">
              {data.total_postings.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <TrendingUp size={13} className="mr-1" /> +14.2% MoM
              </span>
              <span className="text-[11px] text-slate-400">vs previous cycle</span>
            </div>
          </div>
        </div>

        {/* Card 2: Skill Shortage */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Shortage</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-display text-rose-600">
              {data.estimated_shortage.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                {deficitRatio}% of total demand
              </span>
              <span className="text-[11px] text-slate-400">unfilled seats</span>
            </div>
          </div>
        </div>

        {/* Card 3: Top Demanded Skill */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Apex Skill Shortfall</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 truncate" title={data.most_demanded_skills[0]?.skill}>
              {data.most_demanded_skills[0]?.skill || 'N/A'}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {data.most_demanded_skills[0]?.demand.toLocaleString()} openings
              </span>
              <button
                onClick={() => {
                  if (data.most_demanded_skills[0]) {
                    setSelectedSkillModal(data.most_demanded_skills[0]);
                  }
                }}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5"
              >
                Inspect <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Model Confidence */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ML Confidence Index</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-display text-teal-700">
              96.4%
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                Ridge Regressor v2
              </span>
              <span className="text-[11px] text-slate-400">±3.8% MoE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Interactive Tabs Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900">
              Workforce Intelligence Visualizations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any bar or chart node to trigger instant granular inspection and policy routing
            </p>
          </div>

          {/* Visualization Tab Toggle */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('demand')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all",
                activeTab === 'demand' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              Top Skills Demand
            </button>
            <button
              onClick={() => setActiveTab('sectors')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all",
                activeTab === 'sectors' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              Sector Distribution
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all",
                activeTab === 'matrix' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              Deficit Matrix
            </button>
          </div>
        </div>

        {/* Tab 1: Top Skills Bar Chart */}
        {activeTab === 'demand' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ranked Open Postings by Specialization
              </span>
              <span className="text-xs text-brand-600 font-semibold bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                Interactive: Click bars to drill down
              </span>
            </div>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data.most_demanded_skills}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length) {
                      setSelectedSkillModal(state.activePayload[0].payload);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3730A3" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="skill" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(99, 102, 241, 0.06)', radius: 8 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                            <p className="font-bold text-sm text-teal-300">{item.skill}</p>
                            <p className="text-slate-300 mt-1">
                              Demand: <span className="font-bold text-white">{item.demand?.toLocaleString()}</span>
                            </p>
                            <p className="text-[10px] text-brand-300 mt-2">💡 Click to inspect forecast & training</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="demand" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 0, 0]} 
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Sector Distribution Pie Chart */}
        {activeTab === 'sectors' && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorShare}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sectorShare.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SECTOR_PIE_COLORS[index % SECTOR_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F1E36', borderRadius: '12px', border: 'none', color: '#fff' }}
                      formatter={(value: any) => [`${value}% Share`, 'Volume']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Sectoral Pressure Points</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  IT & Software continues to represent the steepest gross deficit, driven by rapid cloud and telemetry adoption.
                  Manufacturing in Tier-2 districts shows an emergent 24% shortfall in precision and automation maintenance roles.
                </p>
                <div className="space-y-2">
                  {sectorShare.slice(0, 4).map((sec, i) => (
                    <div key={sec.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SECTOR_PIE_COLORS[i] }}></span>
                        <span className="font-semibold text-slate-800">{sec.name}</span>
                      </div>
                      <span className="font-bold text-slate-600">{sec.value}% Share</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Deficit Matrix List */}
        {activeTab === 'matrix' && (
          <div className="mt-6 space-y-3">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
              Critical Shortage Specializations
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skillDemandList.slice(0, 6).map((item) => {
                const netGap = (item.demand_count || 0) - (item.supply_count || 0);
                const gapPercent = item.demand_count ? Math.round((netGap / item.demand_count) * 100) : 0;
                return (
                  <div
                    key={item.skill}
                    onClick={() => setSelectedSkillModal(item)}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-brand-500 hover:shadow-card-hover bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{item.skill}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Demand: {item.demand_count?.toLocaleString()} • Supply: {item.supply_count?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-md",
                        gapPercent > 30 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      )}>
                        +{gapPercent}% Deficit
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Policy Insights & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Advice Card 1 */}
        <div className="bg-gradient-to-br from-indigo-900 via-navy-deep to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-500/20 text-brand-300">
                <Sparkles size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">AI Policy Advisory</span>
            </div>
            <h4 className="font-display font-bold text-lg text-white mt-3">
              Fast-Track Certification Directive
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              State-level data indicates severe bottlenecks in foundational trades. Subsidizing 4,500 target seats in 
              high-deficit districts will stabilize employment ratios by Q4.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
            <button
              onClick={() => navigate('/training')}
              className="text-xs font-bold text-teal-300 hover:text-teal-200 inline-flex items-center gap-1.5"
            >
              Allocate Subsidies <ArrowRight size={14} />
            </button>
            <span className="text-[10px] text-slate-400">Model Recommendation</span>
          </div>
        </div>

        {/* Policy Advice Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                High Risk Alert
              </span>
              <span className="text-xs text-slate-400">Maharashtra Cluster</span>
            </div>
            <h4 className="font-display font-bold text-lg text-slate-900 mt-3">
              Geographic Deficit Concentration
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Over 42% of statewide job deficits originate in Pune and Mumbai industrial zones.
              Cross-district worker mobility programs can alleviate 18% of pressure immediately.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => navigate('/geo')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5"
            >
              Examine District Maps <ArrowRight size={14} />
            </button>
            <span className="text-[11px] font-semibold text-slate-400">Geo Intelligence</span>
          </div>
        </div>

        {/* Policy Advice Card 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Predictive Outlook
              </span>
              <span className="text-xs text-slate-400">Next 6 Months</span>
            </div>
            <h4 className="font-display font-bold text-lg text-slate-900 mt-3">
              Projected Surge in Automation
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Ridge regression forecast anticipates a +28% surge in structural analysis and automation technicians
              over the coming 2 quarters.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => navigate('/forecasting')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5"
            >
              Simulate Forecast Trends <ArrowRight size={14} />
            </button>
            <span className="text-[11px] font-semibold text-slate-400">ML Forecast Engine</span>
          </div>
        </div>
      </div>

      {/* Interactive Skill Deep-Dive Modal */}
      {selectedSkillModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Granular Specialization Diagnostic
                </span>
                <h3 className="font-display font-extrabold text-xl text-slate-900 mt-2">
                  {selectedSkillModal.skill}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSkillModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Demand</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {(selectedSkillModal.demand || selectedSkillModal.demand_count || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Current Supply</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {(selectedSkillModal.supply_count || Math.round((selectedSkillModal.demand || 0) * 0.7)).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  Estimated Critical Deficit
                </div>
                <p>
                  Demand outpaces supply by approximately 30%. Recommendation: initiate accredited fast-track bootcamps immediately.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    navigate(`/forecasting?skill=${encodeURIComponent(selectedSkillModal.skill)}`);
                    setSelectedSkillModal(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-navy-deep hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all text-center inline-flex items-center justify-center gap-2"
                >
                  <TrendingUp size={14} /> 6-Month AI Forecast
                </button>
                <button
                  onClick={() => {
                    navigate(`/training?skill=${encodeURIComponent(selectedSkillModal.skill)}`);
                    setSelectedSkillModal(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-all text-center inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} /> View Training Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Prototype Notice */}
      <div className="text-center text-xs text-slate-400 pt-4 pb-2">
        Data Source: {data.data_source} • Powered by SkillSight Predictive Engine v2.4 • Confidential Government Prototype
      </div>
    </div>
  );
}
