import React, { useState, useEffect } from 'react';
import {
  Settings,
  RefreshCw,
  Database,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Shield,
  Key,
  Sliders,
  Server
} from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api';

export default function SettingsPage({ currentRole }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reset confirmation modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleInitDemo = async () => {
    try {
      const res = await api.initDemo();
      alert(res.message);
      loadSettings();
    } catch (err) {
      alert('Error initializing workspace: ' + err.message);
    }
  };

  const handleResetDemo = async (e) => {
    e.preventDefault();
    setResetting(true);
    try {
      const res = await api.resetDemo(confirmationCode);
      setResetMessage(res.message);
      setConfirmationCode('');
      setTimeout(() => {
        setResetModalOpen(false);
        setResetMessage(null);
        loadSettings();
      }, 1500);
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>System Settings & Demo Workspace</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              v2.4.0-Enterprise
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure system parameters, encryption keys, and manage demonstration workspace sandbox records.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Demo Workspace Management Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C152B] via-[#0E1B38] to-[#121A30] border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Database size={16} className="text-cyan-400" />
              <span>Demonstration Workspace Sandbox</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              SentinelMask AI comes pre-loaded with approximately 100 high-fidelity synthetic retail banking records (containing names, PAN numbers, valid Luhn test credit cards, email addresses, phone numbers, and balances).
            </p>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {settings?.records_count || 100} Records Seeded
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleInitDemo}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            Re-Verify Demo Workspace
          </button>

          {currentRole === 'ADMINISTRATOR' ? (
            <button
              onClick={() => {
                setResetModalOpen(true);
                setConfirmationCode('');
              }}
              className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-600/20 flex items-center space-x-1.5"
            >
              <RotateCcw size={13} />
              <span>Reset Demo Workspace (Admin Only)</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">
              Workspace reset requires Administrator role
            </span>
          )}
        </div>
      </div>

      {/* Security Architecture & Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#0D1527]/80 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Sliders size={14} className="text-cyan-400" />
            <span>Detection Engine Thresholds</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200">Default Confidence Threshold</span>
                <p className="text-[11px] text-slate-400">Findings below this score are classified as low risk</p>
              </div>
              <span className="font-mono text-cyan-300 font-bold text-sm">75%</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200">Luhn Checksum Verification</span>
                <p className="text-[11px] text-slate-400">Strictly validates mod 10 formula on credit/debit numbers</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                ALWAYS ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200">Indian PAN Syntax Validator</span>
                <p className="text-[11px] text-slate-400">Validates 5-letter 4-digit 1-letter format and 4th char type</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1527]/80 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Key size={14} className="text-purple-400" />
            <span>Cryptographic Pseudonymization & Keys</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">HMAC-SHA256 Masking Key</span>
              <div className="font-mono text-purple-300 text-[11px] bg-slate-950 p-2 rounded border border-slate-800 truncate">
                sentinel-bfsi-vault-secret-key-2026-sha256-active
              </div>
              <p className="text-[10px] text-slate-500">
                Injected via environment secret; ensures non-reversible pseudonymization for analytics.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Vault Tokenization Format</span>
              <div className="font-mono text-cyan-300 text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                TKN-[CATEGORY]-[HEX4]-[HEX4]
              </div>
              <p className="text-[10px] text-slate-500">
                Preserves format without revealing sensitive source entity records.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Confirm Reset Demo Workspace"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetDemo} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <AlertTriangle size={15} />
              <span>Destructive Demonstration Action</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This will reset synthetic customers, scan jobs, and demo findings back to their pristine baseline. Any external connected data sources will be preserved.
            </p>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-medium">
              Type <strong className="text-rose-400 font-mono">RESET_SENTINEL_DEMO</strong> to confirm:
            </label>
            <input
              type="text"
              required
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="RESET_SENTINEL_DEMO"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-rose-300 focus:border-rose-500 outline-none"
            />
          </div>

          {resetMessage && (
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-1">
              <CheckCircle size={14} />
              <span>{resetMessage}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmationCode !== 'RESET_SENTINEL_DEMO' || resetting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40"
            >
              {resetting ? 'Resetting Workspace...' : 'Confirm Reset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
