import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Server,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  FileSpreadsheet,
  Scan,
  RefreshCw,
  Table
} from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api';

export default function DataSourcesPage({ onTriggerScanForSource }) {
  const [dataSources, setDataSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [loading, setLoading] = useState(true);

  // CSV Upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [saveAsDs, setSaveAsDs] = useState(true);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // New DB Connector state
  const [connectorModalOpen, setConnectorModalOpen] = useState(false);
  const [connectorForm, setConnectorForm] = useState({
    name: '',
    source_type: 'POSTGRESQL',
    host: 'localhost',
    port: 5432,
    database_name: 'prod_bfsi_core',
    description: '',
    environment: 'PRODUCTION'
  });
  const [testResult, setTestResult] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const loadDataSources = async () => {
    setLoading(true);
    try {
      const res = await api.getDataSources();
      setDataSources(res.data || []);
      if (!selectedSource && res.data && res.data.length > 0) {
        setSelectedSource(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load data sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataSources();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await api.testConnection(connectorForm);
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        status: 'DISCONNECTED',
        error: err.message,
        message: 'Network error communicating with backend connector service.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCreateDataSource = async (e) => {
    e.preventDefault();
    try {
      await api.createDataSource(connectorForm);
      setConnectorModalOpen(false);
      setTestResult(null);
      loadDataSources();
    } catch (err) {
      alert('Error creating data source: ' + err.message);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploading(true);
    setUploadResult(null);
    setUploadError(null);
    try {
      const res = await api.uploadCsv(csvFile, saveAsDs);
      setUploadResult(res);
      loadDataSources();
    } catch (err) {
      setUploadError(err.message || 'Failed to process CSV file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Data Sources & Schemas</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {dataSources.length} Configured
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Monitor built-in synthetic datasets, upload CSV archives, and inspect enterprise database connectors.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setUploadModalOpen(true);
              setUploadError(null);
              setUploadResult(null);
            }}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Upload size={14} />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={() => {
              setConnectorModalOpen(true);
              setTestResult(null);
            }}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all"
          >
            <Plus size={14} />
            <span>New DB Connector</span>
          </button>
        </div>
      </div>

      {/* Main split grid: Data Sources list & Schema Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Sources List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span>DATA SOURCES</span>
            <button onClick={loadDataSources} className="hover:text-cyan-400">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-2.5">
            {dataSources.map((ds) => {
              const isSelected = selectedSource?.id === ds.id;
              const isConnected = ds.connection_status === 'CONNECTED';
              return (
                <div
                  key={ds.id}
                  onClick={() => setSelectedSource(ds)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                      : 'bg-[#0D1527]/70 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl ${
                        ds.source_type === 'SYNTHETIC_BFSI'
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : ds.source_type === 'CSV_UPLOAD'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        <Database size={17} />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-100">{ds.name}</h2>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="font-mono text-cyan-300">{ds.source_type}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {ds.environment}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                      isConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                      <span>{ds.connection_status}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {ds.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Last scan: {ds.last_scan_at ? new Date(ds.last_scan_at).toLocaleDateString() : 'Never'}</span>
                    {isConnected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerScanForSource(ds.id);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                      >
                        <Scan size={12} />
                        <span>Scan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Schema Inspector & Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSource ? (
            <div className="rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800/80 p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-100">{selectedSource.name}</h2>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedSource.source_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedSource.description}</p>
                </div>

                <div className="flex items-center space-x-3">
                  {selectedSource.connection_status === 'CONNECTED' ? (
                    <button
                      onClick={() => onTriggerScanForSource(selectedSource.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-cyan-500/20"
                    >
                      <Scan size={14} />
                      <span>Scan Selected Source</span>
                    </button>
                  ) : (
                    <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                      External DB Disconnected
                    </div>
                  )}
                </div>
              </div>

              {/* Schema Preview Section */}
              {selectedSource.schema_info ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Database Schema Preview</h3>
                      <p className="text-xs text-slate-400">
                        Inspecting database: <span className="font-mono text-cyan-300">{selectedSource.schema_info.database}</span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      Total records: <strong className="text-slate-200">{selectedSource.schema_info.total_records}</strong>
                    </span>
                  </div>

                  {selectedSource.schema_info.tables.map((table, tIdx) => (
                    <div key={tIdx} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 font-mono flex items-center space-x-2">
                          <Table size={14} className="text-cyan-400" />
                          <span>{table.name}</span>
                        </span>
                        <span className="text-slate-400">{table.columns.length} columns • {table.row_count} rows</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/40 text-slate-400 border-b border-slate-800/60">
                            <tr>
                              <th className="px-4 py-2 font-medium">Column Name</th>
                              <th className="px-4 py-2 font-medium">Data Type</th>
                              <th className="px-4 py-2 font-medium">Nullable</th>
                              <th className="px-4 py-2 font-medium">Detected PII</th>
                              <th className="px-4 py-2 font-medium">Suggested Masking</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40 text-slate-300">
                            {table.columns.map((col, cIdx) => (
                              <tr key={cIdx} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-2.5 font-mono text-slate-200 font-medium">
                                  {col.name}
                                </td>
                                <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">
                                  {col.type}
                                </td>
                                <td className="px-4 py-2.5">
                                  {col.nullable ? (
                                    <span className="text-slate-400">YES</span>
                                  ) : (
                                    <span className="text-amber-400 font-semibold text-[10px]">NO (NOT NULL)</span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  {col.pii_detected ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                                      {col.pii_detected}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 text-[11px]">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-xs text-slate-300">
                                  {col.pii_detected === 'CREDIT_CARD' && (
                                    <span className="text-rose-400 font-mono">XXXX-XXXX-XXXX-1111</span>
                                  )}
                                  {col.pii_detected === 'EMAIL' && (
                                    <span className="text-cyan-400 font-mono">r***@example.com</span>
                                  )}
                                  {col.pii_detected === 'PAN_IN' && (
                                    <span className="text-purple-400 font-mono">ABXXX1234X</span>
                                  )}
                                  {col.pii_detected === 'PHONE' && (
                                    <span className="text-blue-400 font-mono">98XXXXXX10</span>
                                  )}
                                  {col.pii_detected === 'NAME' && (
                                    <span className="text-amber-400 font-mono">[REDACTED]</span>
                                  )}
                                  {col.pii_detected === 'FINANCIAL' && (
                                    <span className="text-emerald-400 font-mono">Range Aggregation</span>
                                  )}
                                  {col.pii_detected === 'BANK_ACCOUNT' && (
                                    <span className="text-indigo-400 font-mono">Partial Masking</span>
                                  )}
                                  {col.pii_detected === 'CUSTOMER_ID' && (
                                    <span className="text-slate-400 font-mono">Tokenization</span>
                                  )}
                                  {!col.pii_detected && <span className="text-slate-500">Direct Pass</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">Connector Not Connected</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    This external data source ({selectedSource.name}) requires verified network credentials and TCP socket access to inspect schemas. In compliance with BFSI security guidelines, simulated connection data is not fabricated.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              Select a data source on the left to inspect its schema
            </div>
          )}
        </div>
      </div>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload & Inspect CSV Dataset"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCsvUpload} className="space-y-4">
          <p className="text-xs text-slate-300">
            Upload an enterprise customer dataset CSV. The detection engine will automatically inspect headers, validate Luhn checksums on card columns, identify PAN and email patterns, and generate PII findings.
          </p>

          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-900/40">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              className="hidden"
              id="csvFileInput"
            />
            <label htmlFor="csvFileInput" className="cursor-pointer space-y-2 block">
              <Upload size={32} className="mx-auto text-cyan-400" />
              <div className="text-xs font-semibold text-slate-200">
                {csvFile ? csvFile.name : 'Click to select CSV file or drag & drop'}
              </div>
              <p className="text-[11px] text-slate-400">
                Limit: 5MB • Safe memory processing (zero disk leak of unmasked records)
              </p>
            </label>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="saveAsDs"
              checked={saveAsDs}
              onChange={(e) => setSaveAsDs(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="saveAsDs" className="text-xs text-slate-300 cursor-pointer">
              Register as persistent Data Source and save findings in catalog
            </label>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle size={14} />
                <span>Scan Completed: {uploadResult.findings.length} PII Columns Discovered</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Processed {uploadResult.total_rows} rows and {uploadResult.columns.length} columns.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {uploadResult.findings.map((f, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    {f.column_name}: {f.detected_category} ({f.confidence}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!csvFile || uploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
            >
              {uploading ? 'Processing & Scanning...' : 'Start Scan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* New DB Connector Modal */}
      <Modal
        isOpen={connectorModalOpen}
        onClose={() => setConnectorModalOpen(false)}
        title="Add External Database Connector"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateDataSource} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Connection Name</label>
              <input
                type="text"
                required
                value={connectorForm.name}
                onChange={(e) => setConnectorForm({ ...connectorForm, name: e.target.value })}
                placeholder="e.g. Card Gateway Settlement DB"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Source Type</label>
              <select
                value={connectorForm.source_type}
                onChange={(e) => setConnectorForm({
                  ...connectorForm,
                  source_type: e.target.value,
                  port: e.target.value === 'POSTGRESQL' ? 5432 : e.target.value === 'MYSQL' ? 3306 : 0
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="POSTGRESQL">PostgreSQL (Read Replica)</option>
                <option value="MYSQL">MySQL Core DB</option>
                <option value="SQLITE">SQLite Vault</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-300">Host / Hostname</label>
              <input
                type="text"
                value={connectorForm.host}
                onChange={(e) => setConnectorForm({ ...connectorForm, host: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Port</label>
              <input
                type="number"
                value={connectorForm.port}
                onChange={(e) => setConnectorForm({ ...connectorForm, port: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Database Name</label>
            <input
              type="text"
              value={connectorForm.database_name}
              onChange={(e) => setConnectorForm({ ...connectorForm, database_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Test Connection Button & Result */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Genuine TCP Socket Connectivity Test:</span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs border border-slate-700 disabled:opacity-50"
              >
                {testingConnection ? 'Testing Socket...' : 'Test Connection'}
              </button>
            </div>

            {testResult && (
              <div className={`p-2.5 rounded-lg text-xs font-medium flex items-start space-x-2 ${
                testResult.status === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {testResult.status === 'CONNECTED' ? (
                  <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{testResult.message}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Status: {testResult.status} (Latency: {testResult.latency_ms}ms)</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setConnectorModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Save Connector
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
