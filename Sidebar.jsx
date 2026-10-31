import React from 'react';
import {
  LayoutDashboard,
  Database,
  Scan,
  TableProperties,
  ShieldCheck,
  UserCheck,
  Terminal,
  FileClock,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Shield,
  BrainCircuit
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ai', label: 'AI Intelligence', icon: BrainCircuit, badge: 'ML' },
    { id: 'datasources', label: 'Data Sources', icon: Database },
    { id: 'scanner', label: 'PII Scanner', icon: Scan },
    { id: 'explorer', label: 'Data Explorer', icon: TableProperties },
    { id: 'policies', label: 'Masking Policies', icon: ShieldCheck },
    { id: 'rbac', label: 'Access Control', icon: UserCheck },
    { id: 'playground', label: 'Query Playground', icon: Terminal },
    { id: 'audit', label: 'Audit Logs', icon: FileClock },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 transition-all duration-300 flex flex-col justify-between border-r border-slate-800/80 bg-[#090F1E]/95 backdrop-blur-xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60">
          <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                  SentinelMask
                </span>
                <span className="text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase -mt-0.5">
                  AI • BFSI Shield
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  size={19}
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <div className="ml-3 flex items-center justify-between w-full">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-xs text-slate-200 rounded-md shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-3 border-t border-slate-800/60">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>SHIELD ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Zero-Trust Masking Engine Enforcing 7 PII Categories.
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="Shield Active: 100% Zero-Trust">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
