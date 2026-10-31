import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  CheckCircle,
  Database,
  Filter,
  Sparkles,
  RefreshCw,
  Code2,
  Clock,
  Layers,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import api from '../api';

export default function QueryPlaygroundPage({ currentRole }) {
  const [samples, setSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(true);

  // Query Builder Form state
  const [dataset, setDataset] = useState('SYNTHETIC_BFSI_CORE');
  const [selectedFields, setSelectedFields] = useState([
    'customer_reference',
    'synthetic_customer_name',
    'synthetic_email',
    'synthetic_card_number',
    'synthetic_balance'
  ]);
  const [filterField, setFilterField] = useState('');
  const [filterOperator, setFilterOperator] = useState('EQUALS');
  const [filterValue, setFilterValue] = useState('');
  const [limit, setLimit] = useState(15);
  const [simulatedRole, setSimulatedRole] = useState(currentRole);

  // Execution result state
  const [executing, setExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  const allAvailableFields = [
    { id: 'customer_reference', label: 'Customer Ref' },
    { id: 'synthetic_customer_name', label: 'Full Name' },
    { id: 'synthetic_email', label: 'Email' },
    { id: 'synthetic_phone', label: 'Phone' },
    { id: 'synthetic_pan', label: 'PAN ID' },
    { id: 'synthetic_card_number', label: 'Card Number' },
    { id: 'synthetic_account_number', label: 'Account Number' },
    { id: 'synthetic_balance', label: 'Balance' }
  ];

  const loadSamples = async () => {
    setLoadingSamples(true);
    try {
      const res = await api.getSampleQueries();
      setSamples(res.data || []);
    } catch (err) {
      console.error('Failed to load sample queries:', err);
    } finally {
      setLoadingSamples(false);
    }
  };

  useEffect(() => {
    loadSamples();
    handleExecuteQuery();
  }, []);

  const handleExecuteQuery = async (customPayload = null) => {
    setExecuting(true);
    try {
      const payload = customPayload || {
        dataset,
        selected_fields: selectedFields,
        filter_field: filterField,
        filter_operator: filterOperator,
        filter_value: filterValue,
        limit,
        simulated_role: simulatedRole
      };
      const res = await api.executeQuery(payload);
      setQueryResult(res);
    } catch (err) {
      alert('Query execution failed: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleApplySample = (sample) => {
    setDataset(sample.dataset);
    setSelectedFields(sample.selected_fields);
    setFilterField(sample.filter_field || '');
    setFilterOperator(sample.filter_operator || 'EQUALS');
    setFilterValue(sample.filter_value || '');
    setLimit(sample.limit || 15);

    handleExecuteQuery({
      dataset: sample.dataset,
      selected_fields: sample.selected_fields,
      filter_field: sample.filter_field,
      filter_operator: sample.filter_operator,
      filter_value: sample.filter_value,
      limit: sample.limit,
      simulated_role: simulatedRole
    });
  };

  const toggleField = (fieldId) => {
    if (selectedFields.includes(fieldId)) {
      if (selectedFields.length > 1) {
        setSelectedFields(selectedFields.filter(f => f !== fieldId));
      }
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Safe Query Playground</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Validated Execution
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive structured query runner with server-side RBAC masking before data leaves the API.
          </p>
        </div>

        <button
          onClick={() => handleExecuteQuery()}
          disabled={executing}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Play size={14} className={executing ? 'animate-spin' : ''} />
          <span>{executing ? 'Executing Query...' : 'Execute Query'}</span>
        </button>
      </div>

      {/* Pre-built Sample Queries Carousel */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Pre-built BFSI Sample Queries
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {samples.map((s) => (
            <div
              key={s.id}
              onClick={() => handleApplySample(s)}
              className="p-3 rounded-xl bg-[#0D1527]/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1 group"
            >
              <div className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                {s.title}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Query Builder Configuration Box */}
      <div className="p-5 rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Filter size={15} className="text-cyan-400" />
            <span>Structured Query Builder</span>
          </span>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Evaluate as Role:</span>
            <select
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-semibold text-xs outline-none"
            >
              <option value="ADMINISTRATOR">Administrator (Unmasked)</option>
              <option value="SUPPORT_AGENT">Support Agent (Masked)</option>
              <option value="DATA_ANALYST">Data Analyst (Redacted/Aggregated)</option>
            </select>
          </div>
        </div>

        {/* Field Selector pills */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">Select Output Columns:</label>
          <div className="flex flex-wrap gap-2">
            {allAvailableFields.map((f) => {
              const isSelected = selectedFields.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleField(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter criteria row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Filter Column (Optional)</label>
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none"
            >
              <option value="">No Filter (Return All)</option>
              <option value="customer_reference">customer_reference</option>
              <option value="synthetic_customer_name">synthetic_customer_name</option>
              <option value="synthetic_balance">synthetic_balance</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Operator</label>
            <select
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none"
            >
              <option value="EQUALS">Equals</option>
              <option value="CONTAINS">Contains</option>
              <option value="STARTS_WITH">Starts With</option>
              <option value="GREATER_THAN">Greater Than (&gt;)</option>
              <option value="LESS_THAN">Less Than (&lt;)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Filter Value</label>
            <input
              type="text"
              placeholder="e.g. 25000 or CUST-BFSI-10"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Max Rows Limit</label>
            <input
              type="number"
              min="1"
              max="100"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Generated SQL Statement Preview */}
      {queryResult?.meta?.generated_sql && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold flex items-center space-x-1.5">
              <Code2 size={13} className="text-cyan-400" />
              <span>Transformed Parameterized SQL Statement:</span>
            </span>
            <span className="text-emerald-400 font-mono">
              Executed in {queryResult.meta.duration_ms}ms • {queryResult.meta.rows_returned} rows
            </span>
          </div>
          <div className="font-mono text-xs text-cyan-300 overflow-x-auto">
            {queryResult.meta.generated_sql}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">
            Query Results ({queryResult?.data?.length || 0} rows)
          </span>
          <span className="text-[11px] text-slate-400">
            Enforced Role: <strong className="text-cyan-300">{simulatedRole}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                {selectedFields.map((f) => (
                  <th key={f} className="px-4 py-2.5 font-semibold">
                    {f.replace('synthetic_', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {!queryResult?.data || queryResult.data.length === 0 ? (
                <tr>
                  <td colSpan={selectedFields.length} className="px-4 py-8 text-center text-slate-500">
                    No matching records returned
                  </td>
                </tr>
              ) : (
                queryResult.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 font-mono">
                    {selectedFields.map((f) => (
                      <td key={f} className="px-4 py-2.5 text-[11px]">
                        {row[f] === '[REDACTED]' ? (
                          <span className="text-slate-500">[REDACTED]</span>
                        ) : typeof row[f] === 'number' ? (
                          `$${row[f].toLocaleString()}`
                        ) : (
                          String(row[f] || '—')
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
