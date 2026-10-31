import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Modal from './components/Modal';

// Pages
import OverviewPage from './pages/OverviewPage';
import DataSourcesPage from './pages/DataSourcesPage';
import PiiScannerPage from './pages/PiiScannerPage';
import DataExplorerPage from './pages/DataExplorerPage';
import MaskingPoliciesPage from './pages/MaskingPoliciesPage';
import AccessControlPage from './pages/AccessControlPage';
import QueryPlaygroundPage from './pages/QueryPlaygroundPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AiIntelligencePage from './pages/AiIntelligencePage';

import api from './api';
import { Scan, CheckCircle, Bell, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState('ADMINISTRATOR');
  const [openAlerts, setOpenAlerts] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Global Quick Scan Modal state
  const [quickScanModalOpen, setQuickScanModalOpen] = useState(false);
  const [quickScanProgress, setQuickScanProgress] = useState(0);
  const [quickScanStatus, setQuickScanStatus] = useState('');
  const [quickScanResult, setQuickScanResult] = useState(null);

  const fetchAlerts = async () => {
    try {
      const res = await api.getSecurityEvents({ status: 'OPEN' });
      setOpenAlerts(res.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  useEffect(() => {
    api.setRole(currentRole);
    fetchAlerts();
  }, [currentRole]);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    api.setRole(newRole);
  };

  // Global trigger scan handler
  const handleTriggerQuickScan = async (dataSourceId = 'ds-bfsi-synthetic') => {
    setQuickScanModalOpen(true);
    setQuickScanProgress(20);
    setQuickScanStatus('Initializing deep schema inspection & Luhn checksum engine...');
    setQuickScanResult(null);

    try {
      setTimeout(() => {
        setQuickScanProgress(60);
        setQuickScanStatus('Scanning columns for PAN, email, card, and account numbers...');
      }, 500);

      const res = await api.runScan(dataSourceId);

      setTimeout(() => {
        setQuickScanProgress(100);
        setQuickScanStatus('Scan complete! Findings classified.');
        setQuickScanResult(res);
        fetchAlerts();
      }, 1100);

    } catch (err) {
      setQuickScanStatus('Scan halted: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Top Bar Navigation */}
      <Topbar
        activeTab={activeTab}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        openAlertsCount={openAlerts.length}
        onTriggerScan={() => handleTriggerQuickScan()}
        onOpenNotifications={() => setNotificationsOpen(true)}
        collapsed={collapsed}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 p-6 md:p-8 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto pb-12">
          {activeTab === 'overview' && (
            <OverviewPage
              onNavigateTab={(tab) => setActiveTab(tab)}
              onTriggerScan={() => handleTriggerQuickScan()}
            />
          )}

          {activeTab === 'ai' && (
            <AiIntelligencePage
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'datasources' && (
            <DataSourcesPage
              onTriggerScanForSource={(dsId) => handleTriggerQuickScan(dsId)}
            />
          )}

          {activeTab === 'scanner' && (
            <PiiScannerPage
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'explorer' && (
            <DataExplorerPage
              currentRole={currentRole}
            />
          )}

          {activeTab === 'policies' && (
            <MaskingPoliciesPage />
          )}

          {activeTab === 'rbac' && (
            <AccessControlPage
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
            />
          )}

          {activeTab === 'playground' && (
            <QueryPlaygroundPage
              currentRole={currentRole}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsPage />
          )}

          {activeTab === 'reports' && (
            <ReportsPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              currentRole={currentRole}
            />
          )}
        </div>
      </main>

      {/* Global Quick Scan Modal */}
      <Modal
        isOpen={quickScanModalOpen}
        onClose={() => setQuickScanModalOpen(false)}
        title="Autonomous PII Scanner Execution"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-center py-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
            <Scan size={28} className="animate-spin-slow" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100">Scanning Synthetic BFSI Store</h3>
            <p className="text-xs text-slate-400 font-mono">{quickScanStatus}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${quickScanProgress}%` }}
            />
          </div>

          {quickScanResult && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-left space-y-1 text-xs">
              <div className="font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle size={14} />
                <span>Scan Completed</span>
              </div>
              <p className="text-slate-300">
                Discovered <strong className="text-rose-400">{quickScanResult.findings?.length || 0}</strong> PII fields across {quickScanResult.data?.records_examined || 100} records.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2 space-x-2">
            {quickScanResult && (
              <button
                onClick={() => {
                  setQuickScanModalOpen(false);
                  setActiveTab('scanner');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Review Findings
              </button>
            )}
            <button
              onClick={() => setQuickScanModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Notifications Drawer Modal */}
      <Modal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Security Alerts & SIEM Notifications"
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          {openAlerts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle size={24} className="mx-auto text-emerald-400 mb-2" />
              <div className="font-semibold text-slate-200">All Security Checks Passed</div>
              <p>Zero unresolved policy violations or high-risk exposures.</p>
            </div>
          ) : (
            openAlerts.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 flex items-center space-x-1">
                    <AlertTriangle size={13} />
                    <span>{a.event_type}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 font-bold">
                    {a.severity}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{a.description}</p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={async () => {
                      await api.resolveSecurityEvent(a.id);
                      fetchAlerts();
                    }}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
