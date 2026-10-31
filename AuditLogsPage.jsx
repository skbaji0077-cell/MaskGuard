import React, { useState, useEffect } from 'react';
import {
  FileClock,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, total_pages: 1 });
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Metadata Inspector Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, eventsRes] = await Promise.all([
        api.getAuditLogs({
          search,
          action: actionFilter,
          outcome: outcomeFilter,
          page,
          limit: 25
        }),
        api.getSecurityEvents()
      ]);
      setLogs(logsRes.data || []);
      setMeta(logsRes.meta || { total: 0, page: 1, limit: 25, total_pages: 1 });
      setSecurityEvents(eventsRes.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, actionFilter, outcomeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleResolveEvent = async (id) => {
    try {
      await api.resolveSecurityEvent(id);
      loadData();
    } catch (err) {
      alert('Error resolving event: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Security Audit Trail & SIEM</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Immutable Records
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive audit log of scans, policy changes, data retrievals, and access interceptions. Zero raw PII persisted.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Security Incidents Banner */}
      {securityEvents.filter(e => e.status === 'OPEN').length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
            <AlertTriangle size={16} />
            <span>Active Security Alerts ({securityEvents.filter(e => e.status === 'OPEN').length} Unresolved)</span>
          </div>
          <div className="space-y-2">
            {securityEvents.filter(e => e.status === 'OPEN').map(e => (
              <div key={e.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-rose-300">{e.event_type}</span>: {e.description}
                </div>
                <button
                  onClick={() => handleResolveEvent(e.id)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0D1527]/70 border border-slate-800">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by actor, action, correlation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 outline-none"
          >
            <option value="">All Actions</option>
            <option value="SCAN_COMPLETED">SCAN_COMPLETED</option>
            <option value="POLICY_UPDATED">POLICY_UPDATED</option>
            <option value="POLICY_CREATED">POLICY_CREATED</option>
            <option value="DATA_ACCESSED">DATA_ACCESSED</option>
            <option value="DATA_EXPORTED">DATA_EXPORTED</option>
            <option value="ACCESS_DENIED">ACCESS_DENIED</option>
            <option value="QUERY_EXECUTED">QUERY_EXECUTED</option>
          </select>

          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 outline-none"
          >
            <option value="">All Outcomes</option>
            <option value="SUCCESS">Success</option>
            <option value="DENIED">Denied</option>
            <option value="WARNING">Warning</option>
            <option value="FAILED">Failed</option>
          </select>

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">Actor / User</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Resource</th>
                <th className="px-5 py-3 font-semibold">Outcome</th>
                <th className="px-5 py-3 font-semibold">Correlation ID</th>
                <th className="px-5 py-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-slate-500">
                    No audit records match the current filters
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-200">
                      {l.actor_user_id}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                        {l.actor_role}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-cyan-300">
                      {l.action}
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px] truncate max-w-[140px]">
                      {l.resource_type}: {l.resource_id}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 w-max ${
                        l.outcome === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : l.outcome === 'DENIED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <span>{l.outcome}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-[10px]">
                      {l.correlation_id}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(l)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of{' '}
            <strong className="text-slate-200">{meta.total}</strong> audit events
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-semibold text-slate-200">
              Page {meta.page} of {meta.total_pages || 1}
            </span>
            <button
              onClick={() => setPage(Math.min(meta.total_pages, page + 1))}
              disabled={page >= meta.total_pages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Metadata Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Safe Metadata"
        maxWidth="max-w-lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <div><strong>Action:</strong> <span className="font-mono text-cyan-300">{selectedLog.action}</span></div>
              <div><strong>Actor:</strong> {selectedLog.actor_user_id} ({selectedLog.actor_role})</div>
              <div><strong>Correlation ID:</strong> <span className="font-mono text-slate-400">{selectedLog.correlation_id}</span></div>
              <div><strong>Timestamp:</strong> {selectedLog.timestamp}</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Sanitized Event Metadata (JSON):</label>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.safe_metadata, null, 2)}
              </pre>
            </div>

            <div className="text-[11px] text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle size={14} />
              <span>Compliant: No unmasked credit cards, passwords, or raw PII logged.</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
