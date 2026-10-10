import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Database, BarChart2, TrendingUp, Target, BookOpen, Map, FileText, 
  Menu, X, Bell, User, Search, Sparkles, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Overview', path: '/', icon: Home, badge: null },
  { name: 'Labour Data', path: '/labour-data', icon: Database, badge: '10k+' },
  { name: 'Skill Demand', path: '/skill-demand', icon: BarChart2, badge: null },
  { name: 'Forecasting & AI', path: '/forecasting', icon: TrendingUp, badge: 'ML v2' },
  { name: 'Gap Analysis', path: '/gap-analysis', icon: Target, badge: 'Alerts' },
  { name: 'Training & Programs', path: '/training', icon: BookOpen, badge: null },
  { name: 'Geo Intelligence', path: '/geo', icon: Map, badge: null },
  { name: 'Reports & Exports', path: '/reports', icon: FileText, badge: null },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'Severe Shortage Alert', desc: 'Pest Control & Structural Analysis exceeding 40% deficit in Maharashtra.', time: '10m ago', unread: true },
    { id: 2, title: 'Model Retrained', desc: 'Ridge Regression 6-month forecast updated with 95% confidence interval.', time: '1h ago', unread: true },
    { id: 3, title: 'New Training Subsidy', desc: 'Skill Development Corp approved 4 new tech bootcamps.', time: '3h ago', unread: false },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/labour-data?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const currentItem = navItems.find(item => item.path === location.pathname) || navItems[0];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-navy-sidebar text-white flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none border-r border-slate-800/60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-teal-400 p-0.5 shadow-glow-blue">
              <div className="w-full h-full bg-navy-sidebar rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-teal-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-white">SkillSight</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Labour Market Intelligence</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Engine Indicator */}
        <div className="mx-4 my-3 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-300">Live AI Telemetry</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
        </div>

        {/* Navigation Modules */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Intelligence Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/90 to-indigo-600/90 text-white font-semibold shadow-md shadow-brand-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    item.badge === 'Alerts' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                    item.badge === 'ML v2' ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" :
                    "bg-slate-800 text-slate-300 border border-slate-700"
                  )}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/70 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                Govt Intelligence Officer
                <ShieldCheck size={13} className="text-teal-400 shrink-0" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">Ministry of Skill Dev</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span>Platform</span>
                <ChevronRight size={12} />
                <span className="text-brand-600">{currentItem.name}</span>
              </div>
              <h1 className="text-lg lg:text-xl font-bold font-display text-slate-900 tracking-tight">
                {currentItem.name === 'Overview' ? 'Labour Market Executive Command Center' : currentItem.name}
              </h1>
            </div>
          </div>

          {/* Quick Search & Notification Bar */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, sectors, districts..."
                className="w-64 lg:w-80 pl-9 pr-12 py-2 text-xs bg-slate-100/90 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder-slate-400"
              />
              <span className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                ↵
              </span>
            </form>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                aria-label="Notifications"
              >
                <Bell size={19} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Intelligence Alerts</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">2 New</span>
                    </div>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Close
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-3 hover:bg-slate-50 rounded-lg px-2 transition-colors">
                        <div className="flex items-start gap-2.5">
                          {n.id === 1 ? (
                            <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                              <span className="text-[10px] text-slate-400">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">{n.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-center">
                    <NavLink 
                      to="/gap-analysis" 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                      View All Gap Diagnostics <ChevronRight size={13} />
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            <NavLink
              to="/reports"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-glow-blue hover:brightness-105 transition-all"
            >
              <FileText size={14} />
              <span>Generate Brief</span>
            </NavLink>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
