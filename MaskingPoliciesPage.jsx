import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api';

export default function MaskingPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Policy Modal state
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [policyForm, setPolicyForm] = useState({
    policy_name: '',
    description: '',
    data_category: 'CREDIT_CARD',
    target_field: 'synthetic_card_number',
    masking_method: 'CREDIT_CARD_MASKING',
    role_permissions: {
      ADMINISTRATOR: 'UNMASKED',
      SUPPORT_AGENT: 'CREDIT_CARD_MASKING',
      DATA_ANALYST: 'REDACTION'
    },
    policy_status: 'ACTIVE',
    priority: 80
  });

  // Interactive Live Preview Tester state
  const [testInput, setTestInput] = useState('4111111111111111');
  const [testMethod, setTestMethod] = useState('CREDIT_CARD_MASKING');
  const [testCategory, setTestCategory] = useState('CREDIT_CARD');
  const [testOutput, setTestOutput] = useState('');

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await api.getPolicies();
      setPolicies(res.data || []);
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleTestPreview = async (val = testInput, method = testMethod, cat = testCategory) => {
    if (!val) return;
    try {
      const res = await api.previewPolicy(val, method, cat);
      setTestOutput(res.transformed);
    } catch (err) {
      console.error('Preview error:', err);
    }
  };

  useEffect(() => {
    handleTestPreview();
  }, [testInput, testMethod, testCategory]);

  const handleToggle = async (id) => {
    try {
      await api.togglePolicy(id);
      loadPolicies();
    } catch (err) {
      alert('Error toggling policy: ' + err.message);
    }
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    try {
      if (editingPolicyId) {
        await api.updatePolicy(editingPolicyId, policyForm);
      } else {
        await api.createPolicy(policyForm);
      }
      setPolicyModalOpen(false);
      setEditingPolicyId(null);
      loadPolicies();
    } catch (err) {
      alert('Policy validation failed: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setEditingPolicyId(null);
    setPolicyForm({
      policy_name: '',
      description: '',
      data_category: 'CREDIT_CARD',
      target_field: 'synthetic_card_number',
      masking_method: 'CREDIT_CARD_MASKING',
      role_permissions: {
        ADMINISTRATOR: 'UNMASKED',
        SUPPORT_AGENT: 'CREDIT_CARD_MASKING',
        DATA_ANALYST: 'REDACTION'
      },
      policy_status: 'ACTIVE',
      priority: 80
    });
    setPolicyModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPolicyId(p.id);
    setPolicyForm({
      policy_name: p.policy_name,
      description: p.description,
      data_category: p.data_category,
      target_field: p.target_field,
      masking_method: p.masking_method,
      role_permissions: p.role_permissions || {
        ADMINISTRATOR: 'UNMASKED',
        SUPPORT_AGENT: p.masking_method,
        DATA_ANALYST: 'REDACTION'
      },
      policy_status: p.policy_status,
      priority: p.priority || 50
    });
    setPolicyModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Dynamic Masking Policies</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {policies.filter(p => p.policy_status === 'ACTIVE').length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Define declarative transformations, set priority hierarchy, and enforce role-based output specifications.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={14} />
          <span>Create Masking Policy</span>
        </button>
      </div>

      {/* Interactive Policy Test Panel */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0C152B] via-[#0E1B38] to-[#121A30] border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Live Synthetic Transformation Playground
            </h2>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono">Real-time Node.js Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Input Synthetic Value</label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Masking Method</label>
            <select
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-cyan-500 outline-none"
            >
              <option value="CREDIT_CARD_MASKING">Credit Card (XXXX-XXXX-XXXX-1111)</option>
              <option value="EMAIL_MASKING">Email Masking (r***@example.com)</option>
              <option value="PAN_MASKING">Indian PAN (ABXXX1234X)</option>
              <option value="PARTIAL_MASKING">Partial Masking (98XXXXXX10)</option>
              <option value="REDACTION">Full Redaction ([REDACTED])</option>
              <option value="HASHING">Cryptographic HMAC Hash (SHA256)</option>
              <option value="TOKENIZATION">Format-Preserving Token (TKN-...)</option>
              <option value="NUMERIC_AGGREGATION">Numeric Aggregation / Tier</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Masked Output Result</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold">
                {testOutput || 'Calculating...'}
              </div>
              <button
                type="button"
                onClick={() => handleTestPreview()}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Re-run transform"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Policies List Table */}
      <div className="rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Policy Name</th>
                <th className="px-5 py-3 font-semibold">Target Field</th>
                <th className="px-5 py-3 font-semibold">Data Category</th>
                <th className="px-5 py-3 font-semibold">Primary Method</th>
                <th className="px-5 py-3 font-semibold">Role Rules (Admin / Support / Analyst)</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {policies.map((p) => {
                const isActive = p.policy_status === 'ACTIVE';
                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold font-mono text-cyan-400">
                      #{p.priority}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-100">{p.policy_name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-cyan-300">
                      {p.target_field}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {p.data_category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-200">
                      {p.masking_method}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20" title="Administrator">
                          {p.role_permissions?.ADMINISTRATOR || 'UNMASKED'}
                        </span>
                        <span>/</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20" title="Support Agent">
                          {p.role_permissions?.SUPPORT_AGENT || p.masking_method}
                        </span>
                        <span>/</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" title="Data Analyst">
                          {p.role_permissions?.DATA_ANALYST || 'REDACTION'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggle(p.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {p.policy_status}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300"
                        title="Edit Policy"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Modal (Create / Edit) */}
      <Modal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        title={editingPolicyId ? 'Edit Masking Policy' : 'Create New Masking Policy'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSavePolicy} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Policy Name</label>
              <input
                type="text"
                required
                value={policyForm.policy_name}
                onChange={(e) => setPolicyForm({ ...policyForm, policy_name: e.target.value })}
                placeholder="e.g. PCI-DSS Payment Card Redaction"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Data Category</label>
              <select
                value={policyForm.data_category}
                onChange={(e) => setPolicyForm({ ...policyForm, data_category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="CREDIT_CARD">Credit Card Number</option>
                <option value="PAN_IN">Indian PAN Identifier</option>
                <option value="EMAIL">Email Address</option>
                <option value="PHONE">Phone Number</option>
                <option value="BANK_ACCOUNT">Bank Account Number</option>
                <option value="NAME">Full Name</option>
                <option value="FINANCIAL">Account Balance / Financial Metric</option>
                <option value="CUSTOMER_ID">Customer Identifier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Target Field Column</label>
              <input
                type="text"
                required
                value={policyForm.target_field}
                onChange={(e) => setPolicyForm({ ...policyForm, target_field: e.target.value })}
                placeholder="e.g. synthetic_card_number (or * for all matching category)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-cyan-300 focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Masking Method</label>
              <select
                value={policyForm.masking_method}
                onChange={(e) => setPolicyForm({ ...policyForm, masking_method: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="CREDIT_CARD_MASKING">Credit Card (XXXX-XXXX-XXXX-1111)</option>
                <option value="EMAIL_MASKING">Email Masking (r***@example.com)</option>
                <option value="PAN_MASKING">Indian PAN (ABXXX1234X)</option>
                <option value="PARTIAL_MASKING">Partial Masking (98XXXXXX10)</option>
                <option value="REDACTION">Full Redaction ([REDACTED])</option>
                <option value="HASHING">Cryptographic HMAC Hash (SHA256)</option>
                <option value="TOKENIZATION">Format-Preserving Token</option>
                <option value="NUMERIC_AGGREGATION">Numeric Aggregation / Tier</option>
              </select>
            </div>
          </div>

          {/* Role-Specific Access Permissions Configuration */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Role-Specific Access Matrix
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure how this policy renders data for each enterprise role:
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-purple-300">Administrator</label>
                <select
                  value={policyForm.role_permissions?.ADMINISTRATOR || 'UNMASKED'}
                  onChange={(e) => setPolicyForm({
                    ...policyForm,
                    role_permissions: { ...policyForm.role_permissions, ADMINISTRATOR: e.target.value }
                  })}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none"
                >
                  <option value="UNMASKED">Unmasked (Audited)</option>
                  <option value="PARTIAL_MASKING">Partial Masking</option>
                  <option value="REDACTION">Redaction</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-blue-300">Support Agent</label>
                <select
                  value={policyForm.role_permissions?.SUPPORT_AGENT || policyForm.masking_method}
                  onChange={(e) => setPolicyForm({
                    ...policyForm,
                    role_permissions: { ...policyForm.role_permissions, SUPPORT_AGENT: e.target.value }
                  })}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none"
                >
                  <option value={policyForm.masking_method}>Default Policy ({policyForm.masking_method})</option>
                  <option value="PARTIAL_MASKING">Partial Masking</option>
                  <option value="EMAIL_MASKING">Email Masking</option>
                  <option value="PAN_MASKING">PAN Masking</option>
                  <option value="CREDIT_CARD_MASKING">Card Masking</option>
                  <option value="REDACTION">Redaction</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-emerald-300">Data Analyst</label>
                <select
                  value={policyForm.role_permissions?.DATA_ANALYST || 'REDACTION'}
                  onChange={(e) => setPolicyForm({
                    ...policyForm,
                    role_permissions: { ...policyForm.role_permissions, DATA_ANALYST: e.target.value }
                  })}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none"
                >
                  <option value="REDACTION">Full Redaction</option>
                  <option value="HASHING">HMAC Hash</option>
                  <option value="TOKENIZATION">Vault Token</option>
                  <option value="NUMERIC_AGGREGATION">Range Aggregation</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Priority (Higher evaluated first)</label>
              <input
                type="number"
                value={policyForm.priority}
                onChange={(e) => setPolicyForm({ ...policyForm, priority: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Status</label>
              <select
                value={policyForm.policy_status}
                onChange={(e) => setPolicyForm({ ...policyForm, policy_status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setPolicyModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {editingPolicyId ? 'Update Policy' : 'Save Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
