import React, { useEffect, useState, useMemo } from 'react';
import { fetchGeoData, fetchFilters } from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { 
  Map, MapPin, Search, ArrowUpDown, AlertCircle, CheckCircle2, 
  TrendingUp, ArrowRight, Layers, Sliders, X
} from 'lucide-react';
import { cn } from '../Layout';

export default function GeoIntelligence() {
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ states: string[] }>({ states: [] });
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  
  // District comparison state
  const [compareDistrictA, setCompareDistrictA] = useState<string>('');
  const [compareDistrictB, setCompareDistrictB] = useState<string>('');
  const [showComparator, setShowComparator] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters().then((res) => {
      setFilters(res);
      if (res.states.length > 0 && !res.states.includes('Maharashtra')) {
        setSelectedState(res.states[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedState) {
      setLoading(true);
      fetchGeoData({ state: selectedState })
        .then((res) => {
          setData(res);
          setSelectedDistrict(res[0] || null);
          if (res.length >= 2) {
            setCompareDistrictA(res[0].district);
            setCompareDistrictB(res[1].district);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [selectedState]);

  // Filtered district list
  const filteredData = useMemo(() => {
    if (!searchDistrict.trim()) return data;
    const q = searchDistrict.toLowerCase();
    return data.filter(d => d.district?.toLowerCase().includes(q));
  }, [data, searchDistrict]);

  // Total state aggregates
  const totalStateDemand = data.reduce((acc, curr) => acc + (curr.demand_count || 0), 0);
  const totalStateSupply = data.reduce((acc, curr) => acc + (curr.supply_count || 0), 0);
  const totalStateGap = totalStateDemand - totalStateSupply;

  // Compare district objects
  const distAObj = data.find(d => d.district === compareDistrictA);
  const distBObj = data.find(d => d.district === compareDistrictB);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in flex flex-col h-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <Map size={13} className="text-brand-600" />
              Regional & Spatial Workforce Diagnostics
            </span>
            <span className="text-xs text-slate-400">Jurisdiction: {selectedState}</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            District-Level Geospatial Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pinpoint hyper-local labor deficits to deploy targeted training hubs and migration corridors
          </p>
        </div>

        {/* State Selector & Comparator Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {filters.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={() => setShowComparator(!showComparator)}
            className={cn(
              "px-3 py-2 text-xs font-semibold rounded-xl transition-all border inline-flex items-center gap-1.5 shadow-sm",
              showComparator 
                ? "bg-brand-600 text-white border-brand-600 shadow-brand-500/20" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Sliders size={14} /> Compare Districts
          </button>
        </div>
      </div>

      {/* State-Level Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{selectedState} Gross Demand</span>
          <p className="text-2xl font-extrabold font-display text-slate-900 mt-1">
            {totalStateDemand.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Aggregate district openings</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Local Talent Supply</span>
          <p className="text-2xl font-extrabold font-display text-slate-900 mt-1">
            {totalStateSupply.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Certified active pipeline</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">State Net Shortfall</span>
          <p className="text-2xl font-extrabold font-display text-rose-600 mt-1">
            +{totalStateGap.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-600 font-semibold">Priority allocation recommended</span>
        </div>
      </div>

      {/* Side-by-Side District Comparator Drawer/Card */}
      {showComparator && (
        <div className="bg-gradient-to-r from-brand-900 via-navy-deep to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-teal-300" />
              <h3 className="font-bold text-base font-display text-white">Dual-District Equilibrium Comparator</h3>
            </div>
            <button
              onClick={() => setShowComparator(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* District A */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">District A</label>
              <select
                value={compareDistrictA}
                onChange={(e) => setCompareDistrictA(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none"
              >
                {data.map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
              </select>

              {distAObj && (
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Demand:</span>
                    <span className="font-bold text-white">{distAObj.demand_count?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Supply:</span>
                    <span className="font-bold text-white">{distAObj.supply_count?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-300 font-bold pt-2 border-t border-slate-800">
                    <span>Deficit Gap:</span>
                    <span>+{distAObj.gap?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* District B */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">District B</label>
              <select
                value={compareDistrictB}
                onChange={(e) => setCompareDistrictB(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none"
              >
                {data.map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
              </select>

              {distBObj && (
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Demand:</span>
                    <span className="font-bold text-white">{distBObj.demand_count?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Supply:</span>
                    <span className="font-bold text-white">{distBObj.supply_count?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-300 font-bold pt-2 border-t border-slate-800">
                    <span>Deficit Gap:</span>
                    <span>+{distBObj.gap?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Dual Grid: Chart & Interactive Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* District Chart */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/90 p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                District Deficit Ranking ({selectedState})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Estimated gross shortfall by local administrative zone</p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              {data.length} Districts
            </span>
          </div>

          <div className="flex-1 min-h-[350px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="district" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 6 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                          <p className="font-bold text-teal-300 text-sm">{item.district}</p>
                          <p className="text-slate-300">Demand: <span className="font-bold">{item.demand_count?.toLocaleString()}</span></p>
                          <p className="text-slate-300">Supply: <span className="font-bold">{item.supply_count?.toLocaleString()}</span></p>
                          <p className="text-rose-300 font-bold">Deficit: +{item.gap?.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="gap" name="Gross Deficit" fill="#4F46E5" radius={[6, 6, 0, 0]}>
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.gap > 25000 ? '#EF4444' : entry.gap > 15000 ? '#F59E0B' : '#4F46E5'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Detail Table */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/90 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">District Diagnostic Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any district to view targeted telemetry</p>
            </div>
            <div className="relative w-40 sm:w-48">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                placeholder="Filter district..."
                className="w-full pl-7 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200/80 sticky top-0">
                <tr>
                  <th className="px-5 py-3.5 font-bold">District</th>
                  <th className="px-5 py-3.5 font-bold text-right">Demand</th>
                  <th className="px-5 py-3.5 font-bold text-right">Supply</th>
                  <th className="px-5 py-3.5 font-bold text-right">Net Deficit</th>
                  <th className="px-5 py-3.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedDistrict(row)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2">
                      <MapPin size={13} className="text-brand-600 shrink-0" />
                      <span>{row.district}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                      {row.demand_count?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                      {row.supply_count?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-rose-600">
                      +{row.gap?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        row.gap > 25000 ? "bg-rose-50 text-rose-700 border-rose-200" :
                        row.gap > 15000 ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}>
                        {row.gap > 25000 ? 'High Deficit' : row.gap > 15000 ? 'Moderate' : 'Stable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
