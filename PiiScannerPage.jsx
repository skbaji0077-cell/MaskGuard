import React, { useState, useEffect } from 'react';
import {
  Scan,
  ShieldAlert,
  Sliders,
  CheckCircle,
  Play,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
  Zap,
  Tag,
  ArrowRight
} from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api';

export default function PiiScannerPage({ onNavigateTab }) {
  const [activeSubTab, setActiveSubTab] = useState('findings'); // 'findings' | 'rules' | 'scans'
  const [findings, setFindings] = useState([]);
  const [scans, setScans] = useState([]);
  const [rules, setRules] = useState({ built_in: [], custom: [] });
  const [loading, setLoading] = useState(true);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Scanning workflow modal & state
  const [scanningModalOpen, setScanningModalOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [scanResultSummary, setScanResultSummary] = useState(null);

  // New Rule Modal
  const [newRuleModalOpen, setNewRuleModalOpen] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState({
    name: '',
    category: 'CUSTOM_PATTERN',
    columnKeywords: '',
    regex_pattern: '',
    severity: 'HIGH',
    confidenceBase: 85,
    recommendedPolicy: 'PARTIAL_MASKING',
    description: ''
  });
  const [ruleTestVal, setRuleTestVal] = useState('');
  const [ruleTestResult, setRuleTestResult] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [findRes, scanRes, rulesRes] = await Promise.all([
        api.getFindings({ severity: severityFilter, category: categoryFilter }),
        api.getScans(),
        api.getRules()
      ]);
      setFindings(findRes.data || []);
      setScans(scanRes.data || []);
      setRules(rulesRes || { built_in: [], custom: [] });
    } catch (err) {
      console.error('Failed to load scanner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [severityFilter, categoryFilter]);

  // Execute full automated scan workflow with interactive progress
  const handleTriggerScan = async (dataSourceId = 'ds-bfsi-synthetic') => {
    setScanningModalOpen(true);
    setScanProgress(15);
    setScanStepMessage('Connecting to data source & fetching schema columns...');
    setScanResultSummary(null);

    try {
      setTimeout(() => {
        setScanProgress(45);
        setScanStepMessage('Running Luhn checksums and regex pattern matching...');
      }, 500);

      setTimeout(() => {
        setScanProgress(80);
        setScanStepMessage('Validating confidence scores & computing recommended policies...');
      }, 1000);

      const res = await api.runScan(dataSourceId);

      setTimeout(() => {
        setScanProgress(100);
        setScanStepMessage('Scan complete! Findings classified.');
        setScanResultSummary(res);
        loadAll();
      }, 1400);

    } catch (err) {
      setScanStepMessage('Scan failed: ' + err.message);
    }
  };

  const handleTestNewRule = async () => {
    if (!newRuleForm.regex_pattern || !ruleTestVal) return;
    try {
      const res = await api.testRule(newRuleForm.regex_pattern, ruleTestVal);
      setRuleTestResult(res);
    } catch (err) {
      setRuleTestResult({ matches: false, error: err.message });
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await api.createRule(newRuleForm);
      setNewRuleModalOpen(false);
      setRuleTestResult(null);
      loadAll();
    } catch (err) {
      alert('Error saving rule: ' + err.message);
    }
  };

  const filteredFindings = findings.filter(f => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.column_name.toLowerCase().includes(q) ||
      f.detected_category.toLowerCase().includes(q) ||
      f.detection_method.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>PII Detection Engine</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Luhn Checksum • Regex • Heuristics
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Automatically discover, classify, and score sensitive BFSI elements across persistent datasets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setNewRuleModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Plus size={14} />
            <span>Custom Detection Rule</span>
          </button>
          <button
            onClick={() => handleTriggerScan()}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Play size={14} />
            <span>Trigger Full Scan</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('findings')}
          className={`pb-3 transition-colors relative ${
            activeSubTab === 'findings' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Discovered Findings ({findings.length})
          {activeSubTab === 'findings' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('rules')}
          className={`pb-3 transition-colors relative ${
            activeSubTab === 'rules' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Detection Rules & Regex ({(rules.built_in?.length || 0) + (rules.custom?.length || 0)})
          {activeSubTab === 'rules' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('scans')}
          className={`pb-3 transition-colors relative ${
            activeSubTab === 'scans' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Scan Jobs History ({scans.length})
          {activeSubTab === 'scans' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
          )}
        </button>
      </div>

      {/* SubTab 1: Findings Table */}
      {activeSubTab === 'findings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0D1527]/70 border border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search findings by column, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 outline-none"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 outline-none"
              >
                <option value="">All Categories</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="PAN_IN">PAN Identifier</option>
                <option value="EMAIL">Email Address</option>
                <option value="PHONE">Phone Number</option>
                <option value="BANK_ACCOUNT">Bank Account</option>
                <option value="NAME">Customer Name</option>
              </select>

              <button
                onClick={loadAll}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Column Name</th>
                    <th className="px-5 py-3 font-semibold">Data Source / Table</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Detection Method</th>
                    <th className="px-5 py-3 font-semibold">Confidence</th>
                    <th className="px-5 py-3 font-semibold">Severity</th>
                    <th className="px-5 py-3 font-semibold">Recommended Policy</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredFindings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-5 py-8 text-center text-slate-500">
                        No findings match the current filter criteria
                      </td>
                    </tr>
                  ) : (
                    filteredFindings.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-cyan-300 font-semibold">
                          {f.column_name}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-[11px] font-mono">
                          {f.table_name}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {f.detected_category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-slate-300 font-mono">
                          {f.detection_method}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-100">{f.confidence}%</span>
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400 rounded-full"
                                style={{ width: `${f.confidence}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            f.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : f.severity === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : f.severity === 'MEDIUM'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {f.severity}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-200 font-mono text-[11px]">
                          {f.recommended_policy}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Detection Rules & Regex */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.built_in?.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-[#0D1527]/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-100">{r.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                      {r.category}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Built-in
                  </span>
                </div>
                <p className="text-xs text-slate-400">{r.description}</p>
                <div className="bg-slate-900/90 p-2.5 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800/80">
                  {String(r.regex)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Base Confidence: <strong className="text-slate-200">{r.confidenceBase}%</strong></span>
                  <span>Recommended: <strong className="text-slate-200">{r.recommendedPolicy}</strong></span>
                </div>
              </div>
            ))}

            {rules.custom?.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-[#0D1527]/80 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-100">{r.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      {r.category}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                    Custom Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400">{r.description}</p>
                <div className="bg-slate-900/90 p-2.5 rounded-xl font-mono text-[11px] text-purple-300 overflow-x-auto border border-slate-800/80">
                  {r.regex_pattern}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Base Confidence: <strong className="text-slate-200">{r.confidenceBase}%</strong></span>
                  <span>Status: <strong className="text-emerald-400">ACTIVE</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Scan Jobs History */}
      {activeSubTab === 'scans' && (
        <div className="rounded-2xl bg-[#0D1527]/80 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Job ID</th>
                <th className="px-5 py-3 font-semibold">Data Source</th>
                <th className="px-5 py-3 font-semibold">Records Examined</th>
                <th className="px-5 py-3 font-semibold">Fields Scanned</th>
                <th className="px-5 py-3 font-semibold">PII Detected</th>
                <th className="px-5 py-3 font-semibold">Duration / Started</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {scans.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-3.5 font-mono text-cyan-300 font-medium">{s.id}</td>
                  <td className="px-5 py-3.5 text-slate-400">{s.data_source_id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-100">{s.records_examined}</td>
                  <td className="px-5 py-3.5 text-slate-300">{s.fields_scanned}</td>
                  <td className="px-5 py-3.5 font-bold text-rose-400">{s.pii_fields_detected}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                    {new Date(s.started_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Scan Progress Modal */}
      <Modal
        isOpen={scanningModalOpen}
        onClose={() => setScanningModalOpen(false)}
        title="Executing Autonomous PII Detection Scan"
        maxWidth="max-w-lg"
      >
        <div className="space-y-5 text-center py-4">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
            <Scan size={32} className="animate-spin-slow" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">Scanning BFSI Database Schema</h3>
            <p className="text-xs text-slate-400 font-mono">{scanStepMessage}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700/80">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${scanProgress}%` }}
            />
          </div>

          {scanResultSummary && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-left space-y-2 text-xs">
              <div className="font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle size={15} />
                <span>Scan Completed Successfully</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                <div>Records Examined: <strong>{scanResultSummary.data?.records_examined}</strong></div>
                <div>PII Detected: <strong className="text-rose-400">{scanResultSummary.findings?.length}</strong></div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setScanningModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Custom Rule Creation Modal */}
      <Modal
        isOpen={newRuleModalOpen}
        onClose={() => setNewRuleModalOpen(false)}
        title="Add Custom PII Detection Pattern"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Rule Name</label>
              <input
                type="text"
                required
                value={newRuleForm.name}
                onChange={(e) => setNewRuleForm({ ...newRuleForm, name: e.target.value })}
                placeholder="e.g. Employee Tax Identifier"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Category Tag</label>
              <input
                type="text"
                required
                value={newRuleForm.category}
                onChange={(e) => setNewRuleForm({ ...newRuleForm, category: e.target.value.toUpperCase() })}
                placeholder="e.g. TAX_ID_CUSTOM"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Regex Pattern</label>
            <input
              type="text"
              required
              value={newRuleForm.regex_pattern}
              onChange={(e) => setNewRuleForm({ ...newRuleForm, regex_pattern: e.target.value })}
              placeholder="e.g. ^[0-9]{3}-[A-Z]{2}-[0-9]{4}$"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-cyan-300 focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Column Name Keywords (comma-separated)</label>
            <input
              type="text"
              value={newRuleForm.columnKeywords}
              onChange={(e) => setNewRuleForm({ ...newRuleForm, columnKeywords: e.target.value })}
              placeholder="e.g. tax_id, tax_num, employee_tax"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Test Pattern Tester Box */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">Interactive Pattern Tester:</span>
              <button
                type="button"
                onClick={handleTestNewRule}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-[11px]"
              >
                Test Match
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter synthetic sample string to evaluate..."
              value={ruleTestVal}
              onChange={(e) => setRuleTestVal(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
            />
            {ruleTestResult && (
              <div className={`p-2 rounded text-xs font-semibold ${
                ruleTestResult.matches ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {ruleTestResult.matches ? 'Regex matched sample value!' : 'No match found.'}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setNewRuleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Save Detection Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
