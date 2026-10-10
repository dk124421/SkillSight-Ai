import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchForecast, fetchFilters } from '../api';
import { 
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Info, Sliders, Sparkles, CheckCircle2, 
  Search, RefreshCw, AlertTriangle, ShieldCheck, ArrowRight
} from 'lucide-react';
import { cn } from '../Layout';

export default function Forecasting() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSkillParam = searchParams.get('skill') || '';

  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState<{ skills: string[] }>({ skills: [] });
  const [selectedSkill, setSelectedSkill] = useState(initialSkillParam);
  const [searchSkillQuery, setSearchSkillQuery] = useState('');
  const [horizon, setHorizon] = useState<'6m' | '12m' | '24m'>('6m');
  const [interventionBoost, setInterventionBoost] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Popular quick-select skills
  const popularSkills = ['Structural Analysis', 'Pest Control', 'Labor Management', 'Merchandising', 'Sales Forecasting'];

  useEffect(() => {
    fetchFilters().then((res) => {
      setFilters(res);
      if (!selectedSkill && res.skills?.length > 0) {
        setSelectedSkill(res.skills[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSkill) {
      setLoading(true);
      setError('');
      setSearchParams({ skill: selectedSkill });
      fetchForecast(selectedSkill)
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch(() => {
          setError(`Insufficient historical telemetry to train regression for "${selectedSkill}".`);
          setLoading(false);
        });
    }
  }, [selectedSkill]);

  // Combine historical and future forecast points for the chart
  const chartData = useMemo(() => {
    if (!data || !data.historical) return [];

    const historyPoints = data.historical.map((h: any) => ({
      month: h.month,
      actual: h.demand_count,
      forecast: null,
      upperBound: null,
      lowerBound: null,
      simulatedIntervention: null
    }));

    const lastMonth = historyPoints[historyPoints.length - 1];
    const lastActual = lastMonth ? lastMonth.actual : 0;
    const targetForecast = horizon === '6m' 
      ? data.forecast.forecast_6m 
      : horizon === '12m' 
        ? data.forecast.forecast_12m 
        : data.forecast.forecast_24m;

    const moe = data.margin_of_error || 1500;
    const mitigatedShortage = Math.round(targetForecast * (1 - (interventionBoost / 100) * 0.45));

    // Connect last actual to forecast point
    historyPoints[historyPoints.length - 1].forecast = lastActual;
    historyPoints[historyPoints.length - 1].upperBound = lastActual;
    historyPoints[historyPoints.length - 1].lowerBound = lastActual;
    historyPoints[historyPoints.length - 1].simulatedIntervention = lastActual;

    const futurePoints = [
      {
        month: `Proj +${horizon}`,
        actual: null,
        forecast: targetForecast,
        upperBound: targetForecast + moe,
        lowerBound: Math.max(0, targetForecast - moe),
        simulatedIntervention: mitigatedShortage
      }
    ];

    return [...historyPoints, ...futurePoints];
  }, [data, horizon, interventionBoost]);

  const targetForecastValue = data?.forecast 
    ? (horizon === '6m' ? data.forecast.forecast_6m : horizon === '12m' ? data.forecast.forecast_12m : data.forecast.forecast_24m)
    : 0;

  const simulatedMitigatedValue = Math.round(targetForecastValue * (1 - (interventionBoost / 100) * 0.45));
  const savedShortfall = targetForecastValue - simulatedMitigatedValue;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <Sparkles size={13} className="text-brand-600" />
              Machine Learning Predictive Lab
            </span>
            <span className="text-xs text-slate-400">Ridge Regularization • 95% Confidence</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Skill Demand Trajectory & Forecast Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Project enterprise talent requirements up to 24 months forward with live policy intervention modeling
          </p>
        </div>

        {/* Skill Selector Dropdown */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <select 
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            value={selectedSkill} 
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            {filters.skills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Popular Skill Shortcut Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] shrink-0">Popular Specializations:</span>
        {popularSkills.map((sk) => (
          <button
            key={sk}
            onClick={() => setSelectedSkill(sk)}
            className={cn(
              "px-3 py-1.5 rounded-full font-semibold transition-all shrink-0",
              selectedSkill === sk
                ? "bg-navy-deep text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            )}
          >
            {sk}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 bg-white rounded-2xl p-12 border border-slate-200/90 shadow-card">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Fitting Ridge Regression pipeline on historical timeseries...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-700">
          <AlertTriangle size={32} className="mx-auto mb-2 text-rose-500" />
          <p className="font-bold text-sm">{error}</p>
          <p className="text-xs text-rose-600 mt-1">Please select another skill from the dropdown or popular list.</p>
        </div>
      ) : data ? (
        <>
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Monthly Baseline</span>
              <p className="text-3xl font-extrabold font-display text-slate-900 mt-1">
                {data.forecast.current_demand?.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500">Verified current openings</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projected Unmet Demand</span>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-extrabold font-display text-brand-600">
                  {targetForecastValue?.toLocaleString()}
                </p>
                {data.forecast.trend === 'up' ? (
                  <span className="p-1 rounded-md bg-rose-50 text-rose-600 font-bold text-xs flex items-center">
                    <TrendingUp size={14} className="mr-0.5" /> Surge
                  </span>
                ) : (
                  <span className="p-1 rounded-md bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center">
                    <TrendingDown size={14} className="mr-0.5" /> Easing
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">Horizon: {horizon.toUpperCase()}</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Forecast Confidence</span>
              <p className="text-2xl font-extrabold font-display text-teal-700 mt-1">
                {data.forecast.confidence} Confidence
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                <ShieldCheck size={13} className="text-teal-600" />
                <span>R²: {data.forecast.metrics?.r2_score} | MAE: {data.forecast.metrics?.mae}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confidence Margin (MoE)</span>
              <p className="text-2xl font-extrabold font-display text-slate-800 mt-1">
                ±{data.margin_of_error?.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500">95% statistical boundary</span>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Demand Timeseries & Regression Band: {selectedSkill}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Historical observations vs projected future demand with 95% confidence interval shading
                </p>
              </div>

              {/* Horizon Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(['6m', '12m', '24m'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg transition-all",
                      horizon === h ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    +{h.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area & Line Chart */}
            <div className="h-80 sm:h-96 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
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
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <p className="font-bold text-teal-300">{label}</p>
                            {payload.map((entry: any, i: number) => {
                              if (entry.value === null || entry.value === undefined) return null;
                              return (
                                <p key={i} className="text-slate-200">
                                  <span style={{ color: entry.color }} className="font-bold">● </span>
                                  {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
                                </p>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Confidence Interval Upper/Lower */}
                  <Area 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="transparent" 
                    fill="url(#bandGradient)" 
                    name="95% Upper Bound"
                  />
                  {/* Actual Demand */}
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#4F46E5" 
                    strokeWidth={2.5} 
                    fill="url(#actualGradient)" 
                    name="Actual Demand"
                  />
                  {/* Forecast Line */}
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#F59E0B" 
                    strokeWidth={2.5} 
                    strokeDasharray="5 5" 
                    dot={{ r: 4, fill: '#F59E0B' }}
                    name="Projected Baseline" 
                  />
                  {/* Policy Intervention Line */}
                  {interventionBoost > 0 && (
                    <Line 
                      type="monotone" 
                      dataKey="simulatedIntervention" 
                      stroke="#10B981" 
                      strokeWidth={2.5} 
                      strokeDasharray="3 3"
                      dot={{ r: 4, fill: '#10B981' }}
                      name="With Policy Intervention"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* What-If Policy Intervention Simulator */}
            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-2xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-md">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-brand-600" />
                    <h4 className="font-bold text-sm text-slate-900">What-If Policy Intervention Simulator</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Adjust target institutional training subsidy allocation to simulate projected deficit compression.
                  </p>
                </div>

                <div className="flex-1 w-full max-w-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Training Subsidy Expansion</span>
                    <span className="font-bold text-brand-600 font-mono bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      +{interventionBoost}% Capacity
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={interventionBoost}
                    onChange={(e) => setInterventionBoost(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm text-xs min-w-[200px]">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Mitigated Shortage</span>
                  <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                    {interventionBoost > 0 ? `-${savedShortfall.toLocaleString()} positions` : '0 (Baseline)'}
                  </div>
                  <span className="text-[11px] text-slate-500">Estimated shortfall absorbed</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
