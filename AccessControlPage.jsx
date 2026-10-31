import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Eye,
  Sliders,
  FileCheck,
  Key
} from 'lucide-react';
import api from '../api';

export default function AccessControlPage({ currentRole, onRoleChange }) {
  const [testOutput, setTestOutput] = useState(null);
  const [evaluatingRole, setEvaluatingRole] = useState(currentRole);

  const roles = [
    {
      id: 'ADMINISTRATOR',
      title: 'Administrator (SecOps)',
      desc: 'Supervisory role possessing policy creation, scanning orchestration, and auditable unmasking rights.',
      color: 'border-purple-500/40 bg-purple-500/5',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      badgeText: 'Elevated Clearance',
      permissions: [
        { label: 'View all configured data sources', granted: true },
        { label: 'Configure PII scanning & custom regex rules', granted: true },
        { label: 'Create, update, toggle masking policies', granted: true },
        { label: 'Review security audit logs & incident feeds', granted: true },
        { label: 'Export full compliance & findings reports', granted: true },
        { label: 'Access unmasked records with tamper audit logging', granted: true },
        { label: 'Reset demo workspace sandbox', granted: true }
      ]
    },
    {
      id: 'SUPPORT_AGENT',
      title: 'Support Agent (Front-Office Ops)',
      desc: 'Customer service agent viewing partially masked contact & identity fields. Zero raw card access.',
      color: 'border-blue-500/40 bg-blue-500/5',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      badgeText: 'Partial Masked Access',
      permissions: [
        { label: 'Search and inspect customer records', granted: true },
        { label: 'View masked email (r***@example.com)', granted: true },
        { label: 'View masked phone (98XXXXXX10)', granted: true },
        { label: 'View card last 4 digits (XXXX-XXXX-XXXX-1111)', granted: true },
        { label: 'Access full raw credit card number', granted: false },
        { label: 'Modify masking policies or security rules', granted: false },
        { label: 'Inspect administrative audit trails', granted: false }
      ]
    },
    {
      id: 'DATA_ANALYST',
      title: 'Data Analyst (BI & Modeling)',
      desc: 'Analytical user receiving only pseudonymous tokens, HMAC hashes, and binned numeric tiers.',
      color: 'border-emerald-500/40 bg-emerald-500/5',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      badgeText: 'Anonymized & Aggregated Only',
      permissions: [
        { label: 'Execute structured query playground', granted: true },
        { label: 'View aggregated balance ranges (Tier 1-4)', granted: true },
        { label: 'Receive cryptographic pseudonymous HMAC hashes', granted: true },
        { label: 'Receive format-preserving vaulted tokens', granted: true },
        { label: 'View plain customer names or emails', granted: false },
        { label: 'View plain payment card numbers', granted: false },
        { label: 'Modify data sources or security policies', granted: false }
      ]
    }
  ];

  const handleTestEvaluation = async (roleToTest) => {
    setEvaluatingRole(roleToTest);
    try {
      const res = await api.getRecords({ limit: 1 });
      setTestOutput(res.data ? res.data[0] : null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Role-Based Access Control (RBAC)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Zero-Trust Architecture
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographic least-privilege enforcement ensuring raw PII never leaks across non-permitted roles.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Active Session Role:</span>
          <span className="font-bold text-cyan-400 font-mono px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700">
            {currentRole}
          </span>
        </div>
      </div>

      {/* 3 Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((r) => {
          const isCurrent = currentRole === r.id;
          return (
            <div
              key={r.id}
              className={`rounded-2xl border p-5 space-y-4 backdrop-blur-xl transition-all ${
                r.color
              } ${isCurrent ? 'ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-950/20' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">{r.title}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border mt-1 inline-block ${r.badge}`}>
                    {r.badgeText}
                  </span>
                </div>
                {isCurrent && (
                  <span className="text-[10px] bg-cyan-500 text-white font-bold px-2 py-0.5 rounded-full">
                    Current Active
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed min-h-[48px]">
                {r.desc}
              </p>

              {/* Permissions Checklist */}
              <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Enforced Permissions
                </span>
                {r.permissions.map((p, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    {p.granted ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span className={p.granted ? 'text-slate-300' : 'text-slate-500 line-through'}>
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Test / Switch button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onRoleChange(r.id);
                    handleTestEvaluation(r.id);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-cyan-600/80 hover:bg-cyan-500 text-white shadow-md'
                  }`}
                >
                  {isCurrent ? 'Active Evaluation Identity' : `Simulate As ${r.id}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical RBAC Architecture Box */}
      <div className="p-5 rounded-2xl bg-[#0D1527]/80 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <Key size={16} className="text-cyan-400" />
          <span>Server-Side Permission Enforcement Architecture</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Unlike client-side dashboards that hide DOM elements with CSS, SentinelMask AI evaluates role credentials inside Express middleware (<code className="text-cyan-300 font-mono">RbacManager.requirePermission</code>). When a query executes, sensitive attributes are intercepted and transformed on the server before the JSON serialization phase. Unauthorized requests trigger security audit records (<code className="text-purple-300 font-mono">ACCESS_DENIED</code>) and high-severity security events.
        </p>
      </div>
    </div>
  );
}
