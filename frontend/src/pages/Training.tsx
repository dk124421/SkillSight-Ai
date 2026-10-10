import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchTraining, fetchFilters } from '../api';
import { 
  BookOpen, MapPin, Award, CheckCircle2, Clock, Sparkles, Filter, 
  Search, ExternalLink, X, Send, ShieldCheck, GraduationCap
} from 'lucide-react';
import { cn } from '../Layout';

export default function Training() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill') || '';

  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ skills: string[] }>({ skills: [] });
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollModalItem, setEnrollModalItem] = useState<any>(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setSearchParams({ skill: selectedSkill });
      fetchTraining(selectedSkill)
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [selectedSkill]);

  const filteredPrograms = data.filter((item) => {
    if (selectedMode !== 'All' && item.mode !== selectedMode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.program_name?.toLowerCase().includes(q) ||
        item.provider?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollSuccess(true);
    setTimeout(() => {
      setEnrollSuccess(false);
      setEnrollModalItem(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <BookOpen size={13} className="text-brand-600" />
              State Skill Development Directives
            </span>
            <span className="text-xs text-slate-400">Curated for identified deficit specializations</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Institutional Upskilling & Training Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accredited capacity-building pipelines directly addressing high-shortfall labor markets
          </p>
        </div>

        {/* Skill Selector */}
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

      {/* Program Capacity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Enrollment Seats</span>
          <p className="text-2xl font-extrabold font-display text-slate-900 mt-1">24,800</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Govt Subsidized</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accredited Providers</span>
          <p className="text-2xl font-extrabold font-display text-brand-600 mt-1">42 Institutions</p>
          <span className="text-[11px] text-slate-500">NSDC & State Board Certified</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Placement Rate</span>
          <p className="text-2xl font-extrabold font-display text-teal-700 mt-1">87.4%</p>
          <span className="text-[11px] text-slate-500">Post-graduation employment within 90 days</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Mode filter pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['All', 'Online', 'Hybrid', 'Classroom'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMode(m)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                selectedMode === m
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {m === 'All' ? 'All Delivery Modes' : m}
            </button>
          ))}
        </div>

        {/* Keyword Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider or course..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs">
            Loading course recommendations...
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 p-8">
            No training programs found matching current filters.
          </div>
        ) : (
          filteredPrograms.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-slate-200/90 p-6 flex flex-col justify-between transition-all duration-300 group"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 text-brand-600 flex items-center justify-center font-bold">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base font-display text-slate-900 group-hover:text-brand-600 transition-colors">
                        {item.program_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{item.provider}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-[11px] font-bold rounded-lg border border-brand-200 shrink-0">
                    {item.skill}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 py-4 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      Eligibility:
                    </span>
                    <span className="font-semibold text-slate-800">{item.eligibility}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <MapPin size={15} className="text-brand-500" />
                      Delivery Format:
                    </span>
                    <span className="font-semibold text-slate-800">{item.mode}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <Clock size={15} className="text-amber-500" />
                      Duration:
                    </span>
                    <span className="font-semibold text-slate-800">12 Weeks • 180 Hours</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 mt-2">
                    <span className="font-bold text-slate-800">Intervention Rationale: </span>
                    {item.reason}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-2 flex items-center gap-3">
                <button 
                  onClick={() => setEnrollModalItem(item)}
                  className="flex-1 py-2.5 px-4 bg-navy-deep hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Send size={13} />
                  Initiate Cohort Allocation
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Cohort Allocation Modal */}
      {enrollModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Government Sponsored Intake
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 mt-1">
                  Allocate Training Cohort
                </h3>
                <p className="text-xs text-slate-500">{enrollModalItem.program_name}</p>
              </div>
              <button
                onClick={() => setEnrollModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs">
              {enrollSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Cohort Authorization Dispatched!</h4>
                  <p className="text-slate-500">Institutional quota reserved successfully.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target District Center</label>
                    <input
                      type="text"
                      defaultValue="Pune Regional ITI"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Candidate Seats</label>
                    <input
                      type="number"
                      defaultValue={150}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Funding Program</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none">
                      <option>Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)</option>
                      <option>State Industrial Skill Subsidy Fund</option>
                      <option>Specialized IT Transition Grant</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:brightness-105 transition-all"
                    >
                      Confirm Allocation Directive
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
