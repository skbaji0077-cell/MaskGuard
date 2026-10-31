import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Database,
  Scan,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { CategoryDonutChart, SeverityDistributionBar, ScanActivitySparkline } from '../components/Charts';
import api from '../api';

export default function OverviewPage({ onNavigateTab, onTriggerScan }) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [scans, setScans] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repRes, eventsRes, scansRes] = await Promise.all([
        api.getReportSummary(),
        api.getSecurityEvents({ status: 'OPEN' }),
        api.getScans()
      ]);
      setReport(repRes);
      setSecurityEvents(eventsRes.data || []);
      setScans(scansRes.data || []);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const overview = report?.executive_overview || {};
  const findingsBreakdown = report?.findings_breakdown || {};

  return (
    <div className="space-y-6">
      {/* Security Status Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C1A32] via-[#0E1F3D] to-[#141B30] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>BFSI SHIELD OPERATIONAL • ZERO RAW LEAKS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SentinelMask AI <span className="text-cyan-400 font-light">Data Shield</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Automatic PII discovery, dynamic server-side masking policies, and cryptographic RBAC protecting customer financial records across enterprise databases.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 font-mono">
                Status: <strong className="text-emerald-400">100% Policy Enforced</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 font-mono">
                Dataset: <strong className="text-cyan-400">Synthetic BFSI Core</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 font-mono">
                PCI-DSS & DPDP: <strong className="text-emerald-400">Active</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onTriggerScan}
              className="flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Scan size={18} className="animate-spin-slow" />
              <span>Run PII Scan Now</span>
            </button>
            <button
              onClick={loadData}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center justify-center"
              title="Refresh Dashboard Metrics"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Data Sources"
          value={overview.total_data_sources || 0}
          subvalue={`${overview.connected_sources || 0} Connected / Monitored`}
          icon={Database}
          accent="cyan"
          badge="Verified"
        />
        <StatCard
          title="Sensitive Fields Discovered"
          value={overview.sensitive_fields_discovered || 0}
          subvalue="Classified across 7 PII categories"
          icon={ShieldAlert}
          accent="purple"
          trend="+7 Found"
          trendPositive={false}
        />
        <StatCard
          title="Active Masking Policies"
          value={overview.active_masking_policies || 0}
          subvalue="100% Coverage of discovered PII"
          icon={ShieldCheck}
          accent="emerald"
          badge="Enforced"
        />
        <StatCard
          title="Security Violations Intercepted"
          value={overview.access_violations_intercepted || 0}
          subvalue={`${overview.open_security_alerts || 0} Open attention items`}
          icon={Lock}
          accent="rose"
          trend="0 Leaks"
          trendPositive={true}
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D1527]/70 border border-slate-800/80 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Scan Success Rate</div>
            <div className="text-lg font-bold text-slate-100">{overview.scan_success_rate_percent || 100}%</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/70 border border-slate-800/80 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Compliance Score</div>
            <div className="text-lg font-bold text-slate-100">{overview.compliance_coverage_percent || 100}%</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/70 border border-slate-800/80 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Scan size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Scan Jobs</div>
            <div className="text-lg font-bold text-slate-100">{overview.total_scans_run || 0}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/70 border border-slate-800/80 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Engine Mode</div>
            <div className="text-lg font-bold text-emerald-400">Zero-Trust</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PII Findings by Category (Donut) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Discovered PII by Category</h2>
              <p className="text-xs text-slate-400">Real-time classification based on column heuristics & regex patterns</p>
            </div>
            <button
              onClick={() => onNavigateTab('scanner')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>View Findings</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <CategoryDonutChart data={findingsBreakdown.by_category || {}} />
        </div>

        {/* Severity Distribution */}
        <div className="rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Severity Breakdown</h2>
              <p className="text-xs text-slate-400">Risk rating of sensitive assets</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
              PCI & PAN
            </span>
          </div>
          <SeverityDistributionBar counts={findingsBreakdown.by_severity || {}} />
          <div className="pt-2 border-t border-slate-800">
            <ScanActivitySparkline scans={scans} />
          </div>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions & Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Workflows Guide */}
        <div className="rounded-2xl bg-[#0D1527]/80 border border-slate-800/80 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Hackathon Demonstration Steps</h2>
          <p className="text-xs text-slate-400">Guided tour of BFSI Problem Statement 11 capabilities:</p>

          <div className="space-y-2 text-xs">
            <div
              onClick={() => onNavigateTab('datasources')}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px]">1</span>
                <span className="text-slate-200 font-medium">Review Data Sources & Connectors</span>
              </div>
              <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div
              onClick={() => onNavigateTab('scanner')}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-[11px]">2</span>
                <span className="text-slate-200 font-medium">Run PII Detection & Luhn Checks</span>
              </div>
              <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div
              onClick={() => onNavigateTab('policies')}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[11px]">3</span>
                <span className="text-slate-200 font-medium">Configure Masking Policies & Roles</span>
              </div>
              <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div
              onClick={() => onNavigateTab('explorer')}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[11px]">4</span>
                <span className="text-slate-200 font-medium">Explore Role Comparison & Masks</span>
              </div>
              <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>

        {/* Security Alerts Feed */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0D1527]/80 border border-slate-800/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Security Events & Alerts</h2>
              <p className="text-xs text-slate-400">Interceptions and schema vulnerability warnings</p>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View All Logs
            </button>
          </div>

          <div className="space-y-2">
            {securityEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                All security alerts resolved. Zero active vulnerabilities.
              </div>
            ) : (
              securityEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      event.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      <AlertTriangle size={15} />
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center space-x-2">
                        <span>{event.event_type}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          event.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{event.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await api.resolveSecurityEvent(event.id);
                      loadData();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium shrink-0 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
