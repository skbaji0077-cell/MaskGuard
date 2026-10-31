import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  User,
  Scan,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function Topbar({
  activeTab,
  currentRole,
  onRoleChange,
  openAlertsCount = 0,
  onTriggerScan,
  onOpenNotifications,
  collapsed
}) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const tabTitles = {
    overview: 'Executive Security Overview',
    ai: 'AI Intelligence & Machine Learning Hub',
    datasources: 'Data Sources & Connector Vault',
    scanner: 'Automatic PII Detection Engine',
    explorer: 'Interactive Masked Data Explorer',
    policies: 'Dynamic Masking Policy Management',
    rbac: 'Role-Based Access Control (RBAC)',
    playground: 'Safe Query Playground',
    audit: 'Immutable Security Audit Logs',
    reports: 'Compliance & Protection Reports',
    settings: 'System Settings & Demo Workspace'
  };

  const roles = [
    {
      id: 'ADMINISTRATOR',
      label: 'Administrator (SecOps)',
      desc: 'Full policy authoring, unmasked access audit, scan orchestration'
    },
    {
      id: 'SUPPORT_AGENT',
      label: 'Support Agent (Front-Office)',
      desc: 'Customer verification with partially masked emails, phones & card last-4'
    },
    {
      id: 'DATA_ANALYST',
      label: 'Data Analyst (BI / Analytics)',
      desc: 'Aggregated ranges, pseudonymous tokens, zero raw PII exposure'
    }
  ];

  const currentRoleInfo = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <header
      className={`h-16 fixed top-0 right-0 z-20 border-b border-slate-800/80 bg-[#070C18]/90 backdrop-blur-xl flex items-center justify-between px-6 transition-all duration-300 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="hover:text-cyan-400 cursor-pointer">SentinelMask</span>
          <span>/</span>
          <span className="capitalize text-slate-200 font-medium">{activeTab}</span>
        </div>
        <h1 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
          <span>{tabTitles[activeTab] || 'Dashboard'}</span>
        </h1>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center space-x-4">
        {/* Role Evaluator Bar */}
        <div className="relative">
          <div
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <div className={`w-2 h-2 rounded-full ${
              currentRole === 'ADMINISTRATOR'
                ? 'bg-purple-400 shadow-purple-500/50 shadow'
                : currentRole === 'SUPPORT_AGENT'
                ? 'bg-blue-400 shadow-blue-500/50 shadow'
                : 'bg-emerald-400 shadow-emerald-500/50 shadow'
            }`} />
            <span className="text-xs text-slate-300 font-medium">Role:</span>
            <span className="text-xs font-semibold text-cyan-300">{currentRole}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0D1527] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Simulate Role Evaluation
              </div>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    onRoleChange(r.id);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all text-xs flex flex-col ${
                    currentRole === r.id
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="font-semibold flex items-center justify-between">
                    <span>{r.label}</span>
                    {currentRole === r.id && (
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5">{r.desc}</span>
                </button>
              ))}
              <div className="border-t border-slate-800 mt-1 pt-1.5 px-3 text-[10px] text-slate-400">
                Backend strictly transforms queries & exports based on this identity.
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: Run PII Scan */}
        <button
          onClick={onTriggerScan}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Scan size={14} className="animate-spin-slow" />
          <span>Run PII Scan</span>
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Security Notifications"
        >
          <Bell size={18} />
          {openAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {openAlertsCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-500/10">
            {currentRole === 'ADMINISTRATOR' ? 'AD' : currentRole === 'SUPPORT_AGENT' ? 'SA' : 'DA'}
          </div>
        </div>
      </div>
    </header>
  );
}
