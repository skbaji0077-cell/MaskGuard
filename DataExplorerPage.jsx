import React, { useState, useEffect } from 'react';
import {
  TableProperties,
  Search,
  Filter,
  Download,
  Eye,
  ShieldCheck,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api';

export default function DataExplorerPage({ currentRole }) {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('customer_reference');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  // Column visibility
  const [visibleCols, setVisibleCols] = useState({
    customer_reference: true,
    synthetic_customer_name: true,
    synthetic_email: true,
    synthetic_phone: true,
    synthetic_pan: true,
    synthetic_card_number: true,
    synthetic_account_number: true,
    synthetic_balance: true
  });
  const [colSelectorOpen, setColSelectorOpen] = useState(false);

  // Role comparison modal state
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await api.getRecords({
        search,
        page,
        limit: 10,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setRecords(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, limit: 10, total_pages: 1 });
    } catch (err) {
      console.error('Failed to load explorer records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [page, sortBy, sortOrder, currentRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadRecords();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleOpenComparison = async (recordId) => {
    setComparisonModalOpen(true);
    setLoadingComparison(true);
    try {
      const res = await api.getRoleComparison(recordId);
      setComparisonData(res);
    } catch (err) {
      console.error('Failed to load role comparison:', err);
    } finally {
      setLoadingComparison(false);
    }
  };

  const handleExport = (format) => {
    const url = api.getExportUrl(format);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Customer Record Explorer</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Role: {currentRole}
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive view of synthetic BFSI customer records with server-side dynamic masking enforced.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {/* Column Toggle dropdown */}
          <div className="relative">
            <button
              onClick={() => setColSelectorOpen(!colSelectorOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
            >
              <SlidersHorizontal size={13} />
              <span>Columns</span>
            </button>

            {colSelectorOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0D1527] border border-slate-700 rounded-2xl shadow-2xl p-3 z-40 space-y-2 text-xs">
                <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">
                  Visible Columns
                </div>
                {Object.keys(visibleCols).map((col) => (
                  <label key={col} className="flex items-center space-x-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={visibleCols[col]}
                      onChange={(e) => setVisibleCols({ ...visibleCols, [col]: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="truncate">{col.replace('synthetic_', '')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export button */}
          <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 overflow-hidden text-xs">
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-2 hover:bg-slate-700 text-slate-200 font-semibold flex items-center space-x-1"
              title="Export authorized records as CSV"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
            <span className="w-px h-4 bg-slate-700" />
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-2 hover:bg-slate-700 text-slate-200 font-semibold"
              title="Export authorized records as JSON"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Search and Table Filters */}
      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 p-3 rounded-2xl bg-[#0D1527]/70 border border-slate-800">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer reference, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setPage(1);
            loadRecords();
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          title="Reset filters"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </form>

      {/* Data Records Table */}
      <div className="rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                {visibleCols.customer_reference && (
                  <th
                    onClick={() => handleSort('customer_reference')}
                    className="px-4 py-3 font-semibold cursor-pointer hover:text-cyan-300"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer Ref</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                )}
                {visibleCols.synthetic_customer_name && (
                  <th
                    onClick={() => handleSort('synthetic_customer_name')}
                    className="px-4 py-3 font-semibold cursor-pointer hover:text-cyan-300"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                )}
                {visibleCols.synthetic_email && (
                  <th className="px-4 py-3 font-semibold">Email</th>
                )}
                {visibleCols.synthetic_phone && (
                  <th className="px-4 py-3 font-semibold">Phone</th>
                )}
                {visibleCols.synthetic_pan && (
                  <th className="px-4 py-3 font-semibold">PAN (Tax ID)</th>
                )}
                {visibleCols.synthetic_card_number && (
                  <th className="px-4 py-3 font-semibold">Card Number</th>
                )}
                {visibleCols.synthetic_account_number && (
                  <th className="px-4 py-3 font-semibold">Account No.</th>
                )}
                {visibleCols.synthetic_balance && (
                  <th
                    onClick={() => handleSort('synthetic_balance')}
                    className="px-4 py-3 font-semibold cursor-pointer hover:text-cyan-300"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Balance</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                )}
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                    No records found matching your query
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    {visibleCols.customer_reference && (
                      <td className="px-4 py-3 font-mono font-semibold text-cyan-300">
                        {r.customer_reference}
                      </td>
                    )}
                    {visibleCols.synthetic_customer_name && (
                      <td className="px-4 py-3 font-medium">
                        {r.synthetic_customer_name === '[REDACTED]' ? (
                          <span className="text-slate-500 font-mono text-[11px]">[REDACTED]</span>
                        ) : (
                          r.synthetic_customer_name
                        )}
                      </td>
                    )}
                    {visibleCols.synthetic_email && (
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {r.synthetic_email === '[REDACTED]' ? (
                          <span className="text-slate-500">[REDACTED]</span>
                        ) : (
                          <span className="text-slate-300">{r.synthetic_email}</span>
                        )}
                      </td>
                    )}
                    {visibleCols.synthetic_phone && (
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                        {r.synthetic_phone}
                      </td>
                    )}
                    {visibleCols.synthetic_pan && (
                      <td className="px-4 py-3 font-mono text-purple-300 text-[11px]">
                        {r.synthetic_pan}
                      </td>
                    )}
                    {visibleCols.synthetic_card_number && (
                      <td className="px-4 py-3 font-mono text-rose-300 text-[11px]">
                        {r.synthetic_card_number === '[REDACTED]' ? (
                          <span className="text-slate-500">[REDACTED]</span>
                        ) : (
                          r.synthetic_card_number
                        )}
                      </td>
                    )}
                    {visibleCols.synthetic_account_number && (
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {r.synthetic_account_number}
                      </td>
                    )}
                    {visibleCols.synthetic_balance && (
                      <td className="px-4 py-3 font-semibold text-emerald-400 text-xs">
                        {typeof r.synthetic_balance === 'number'
                          ? `$${r.synthetic_balance.toLocaleString()}`
                          : r.synthetic_balance}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenComparison(r.id)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all inline-flex items-center space-x-1"
                        title="Compare how this record is presented across Administrator, Support Agent, and Analyst roles"
                      >
                        <Eye size={12} />
                        <span>Compare Roles</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of{' '}
            <strong className="text-slate-200">{meta.total}</strong> synthetic records
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

      {/* Multi-Role Comparison Modal */}
      <Modal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        title="Role-Based Security Masking Comparison"
        maxWidth="max-w-4xl"
      >
        {loadingComparison ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Evaluating server-side security policies across all roles...
          </div>
        ) : comparisonData ? (
          <div className="space-y-6">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Target Record Reference: </span>
                <strong className="font-mono text-cyan-300">{comparisonData.customer_reference}</strong>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                Server-Side Masking Enforced
              </span>
            </div>

            {/* 3 Role Columns Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Role 1: Administrator */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/40 space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <h3 className="font-bold text-xs text-purple-300 uppercase tracking-wider">
                    Administrator
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Name:</span>
                    <div className="font-semibold text-slate-100">{comparisonData.roles_comparison?.ADMINISTRATOR?.synthetic_customer_name}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Email:</span>
                    <div className="font-mono text-slate-200">{comparisonData.roles_comparison?.ADMINISTRATOR?.synthetic_email}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Card Number:</span>
                    <div className="font-mono text-rose-300 font-semibold">{comparisonData.roles_comparison?.ADMINISTRATOR?.synthetic_card_number}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">PAN ID:</span>
                    <div className="font-mono text-purple-300 font-semibold">{comparisonData.roles_comparison?.ADMINISTRATOR?.synthetic_pan}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Balance:</span>
                    <div className="font-semibold text-emerald-400">${comparisonData.roles_comparison?.ADMINISTRATOR?.synthetic_balance?.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-[10px] text-purple-300/80 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                  Full access with tamper-evident audit logging.
                </div>
              </div>

              {/* Role 2: Support Agent */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/40 space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <h3 className="font-bold text-xs text-blue-300 uppercase tracking-wider">
                    Support Agent
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Name:</span>
                    <div className="font-semibold text-slate-100">{comparisonData.roles_comparison?.SUPPORT_AGENT?.synthetic_customer_name}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Email:</span>
                    <div className="font-mono text-cyan-300">{comparisonData.roles_comparison?.SUPPORT_AGENT?.synthetic_email}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Card Number:</span>
                    <div className="font-mono text-rose-400 font-semibold">{comparisonData.roles_comparison?.SUPPORT_AGENT?.synthetic_card_number}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">PAN ID:</span>
                    <div className="font-mono text-purple-400 font-semibold">{comparisonData.roles_comparison?.SUPPORT_AGENT?.synthetic_pan}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Balance:</span>
                    <div className="font-semibold text-emerald-400">${comparisonData.roles_comparison?.SUPPORT_AGENT?.synthetic_balance?.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-[10px] text-blue-300/80 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                  Card truncated to last 4 digits (PCI-DSS compliant).
                </div>
              </div>

              {/* Role 3: Data Analyst */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/40 space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="font-bold text-xs text-emerald-300 uppercase tracking-wider">
                    Data Analyst
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Name:</span>
                    <div className="font-mono text-slate-500 font-semibold">{comparisonData.roles_comparison?.DATA_ANALYST?.synthetic_customer_name}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Email:</span>
                    <div className="font-mono text-slate-500">{comparisonData.roles_comparison?.DATA_ANALYST?.synthetic_email}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Card Number:</span>
                    <div className="font-mono text-slate-500 font-semibold">{comparisonData.roles_comparison?.DATA_ANALYST?.synthetic_card_number}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">PAN ID:</span>
                    <div className="font-mono text-purple-300 text-[11px] truncate">{comparisonData.roles_comparison?.DATA_ANALYST?.synthetic_pan}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Balance:</span>
                    <div className="font-semibold text-amber-400">{comparisonData.roles_comparison?.DATA_ANALYST?.synthetic_balance}</div>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-300/80 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  Full redaction of identifiers + balance binning.
                </div>
              </div>
            </div>

            {/* Explanations section */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <Info size={14} className="text-cyan-400" />
                <span>Why Each Field was Transformed:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(comparisonData.explanations || {}).map(([key, exp]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-300 font-semibold">{key.replace('synthetic_', '')}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{exp.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{exp.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
