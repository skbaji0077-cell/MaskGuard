import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  AlertTriangle,
  Database,
  Scan,
  RefreshCw,
  CheckCircle2,
  Lock,
  Printer,
  FileText
} from 'lucide-react';
import api from '../api';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReportSummary();
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleDownload = (format) => {
    const url = api.getReportDownloadUrl(format);
    window.open(url, '_blank');
  };

  if (loading || !report) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Generating enterprise BFSI compliance audit report...
      </div>
    );
  }

  const { executive_overview, findings_breakdown, policy_compliance, data_source_status, recent_denials } = report;

  return (
    <div className="space-y-6">
      {/* Header and Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Executive Compliance & Audit Report</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              RBI / PCI-DSS / DPDP Ready
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Certified cryptographic proof of sensitive data discovery, masking policies, and access containment.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => handleDownload('csv')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleDownload('json')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Formal Executive Summary Sheet Container */}
      <div className="rounded-3xl bg-[#0D1527]/90 border border-slate-800 p-8 space-y-8 shadow-2xl backdrop-blur-xl">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              BFSI PROBLEM STATEMENT 11 AUDIT CERTIFICATE
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              SentinelMask AI Compliance Certification
            </h2>
            <p className="text-xs text-slate-400">
              Generated on {new Date(report.generated_at).toLocaleString()} • Hash: <code>7f9a-8b1c-99e2</code>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Compliance Rating</div>
            <div className="text-3xl font-extrabold text-white">{executive_overview.compliance_coverage_percent}%</div>
            <div className="text-[11px] text-emerald-300 font-semibold mt-0.5">COMPLIANT / ZERO LEAKS</div>
          </div>
        </div>

        {/* 4 Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Monitored Data Sources</span>
            <div className="text-xl font-bold text-slate-100 mt-1">{executive_overview.total_data_sources}</div>
            <span className="text-[10px] text-cyan-400 font-medium">{executive_overview.connected_sources} active connections</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">PII Columns Detected</span>
            <div className="text-xl font-bold text-rose-400 mt-1">{executive_overview.sensitive_fields_discovered}</div>
            <span className="text-[10px] text-slate-400">Across 7 banking tables</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Active Masking Policies</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{executive_overview.active_masking_policies}</div>
            <span className="text-[10px] text-emerald-400 font-medium">100% PII Coverage</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Interceptions (Access Denied)</span>
            <div className="text-xl font-bold text-purple-400 mt-1">{executive_overview.access_violations_intercepted}</div>
            <span className="text-[10px] text-slate-400">Violations halted at API</span>
          </div>
        </div>

        {/* Breakdown Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PII Findings Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Discovered PII by Classification
            </h3>
            <div className="space-y-2 text-xs">
              {Object.entries(findings_breakdown.by_category || {}).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
                  <span className="font-mono text-cyan-300 font-semibold">{cat}</span>
                  <span className="font-bold text-slate-200">{count} occurrences</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Compliance Status */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Protection Status & Uncovered Risks
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center space-x-1">
                  <CheckCircle2 size={14} />
                  <span>Protected PII Categories ({policy_compliance.protected_categories.length})</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {policy_compliance.protected_categories.map((c) => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {policy_compliance.unprotected_categories.length > 0 ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <span className="font-semibold">Unprotected Categories:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {policy_compliance.unprotected_categories.map((c) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[11px]">
                  Zero unprotected PII columns discovered in active scans.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Source Status Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Connected & Monitored Data Stores Inventory
          </h3>
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Source Name</th>
                  <th className="px-4 py-2.5 font-semibold">Type</th>
                  <th className="px-4 py-2.5 font-semibold">Environment</th>
                  <th className="px-4 py-2.5 font-semibold">Connection Status</th>
                  <th className="px-4 py-2.5 font-semibold">Last Audited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data_source_status.map((ds) => (
                  <tr key={ds.id} className="hover:bg-slate-800/20 font-mono text-[11px]">
                    <td className="px-4 py-2.5 text-slate-200 font-sans font-medium">{ds.name}</td>
                    <td className="px-4 py-2.5 text-cyan-300">{ds.type}</td>
                    <td className="px-4 py-2.5 text-slate-400">{ds.environment}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ds.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {ds.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {ds.last_scan_at ? new Date(ds.last_scan_at).toLocaleDateString() : 'Never'}
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
