/**
 * SentinelMask AI - Frontend API Service Layer
 * Connects UI views to Express backend with role headers and error handling
 */

const BASE_URL = '/api';

class ApiService {
  constructor() {
    this.currentRole = 'ADMINISTRATOR'; // Default demo administrator role
    this.currentUserId = 'sec_admin_raj';
  }

  setRole(role) {
    this.currentRole = role;
  }

  getRole() {
    return this.currentRole;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-User-Role': this.currentRole,
      'X-User-Id': this.currentUserId
    };
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = options.isFormData
      ? { 'X-User-Role': this.currentRole, 'X-User-Id': this.currentUserId }
      : { ...this.getHeaders(), ...(options.headers || {}) };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { error: response.statusText };
        }
        throw new Error(errData.message || errData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // Settings & System
  getSettings() {
    return this.request('/settings');
  }

  initDemo() {
    return this.request('/settings/init-demo', { method: 'POST' });
  }

  resetDemo(confirmationCode) {
    return this.request('/settings/reset-demo', {
      method: 'POST',
      body: JSON.stringify({ confirmation_code: confirmationCode })
    });
  }

  // Data Sources
  getDataSources() {
    return this.request('/datasources');
  }

  getDataSource(id) {
    return this.request(`/datasources/${id}`);
  }

  createDataSource(data) {
    return this.request('/datasources', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  testConnection(params) {
    return this.request('/datasources/test-connection', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Scans & Findings
  getScans() {
    return this.request('/scans');
  }

  getScan(id) {
    return this.request(`/scans/${id}`);
  }

  runScan(dataSourceId) {
    return this.request('/scans/run', {
      method: 'POST',
      body: JSON.stringify({ data_source_id: dataSourceId })
    });
  }

  getFindings(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/scans/findings/list${qs ? `?${qs}` : ''}`);
  }

  updateFinding(id, status) {
    return this.request(`/scans/findings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  getRules() {
    return this.request('/scans/rules/all');
  }

  createRule(ruleData) {
    return this.request('/scans/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
  }

  testRule(pattern, sampleValue) {
    return this.request('/scans/rules/test', {
      method: 'POST',
      body: JSON.stringify({ pattern, sample_value: sampleValue })
    });
  }

  // Data Explorer
  getRecords(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/explorer/records${qs ? `?${qs}` : ''}`);
  }

  getRoleComparison(recordId) {
    return this.request(`/explorer/role-comparison/${recordId}`);
  }

  getExportUrl(format = 'csv') {
    return `${BASE_URL}/explorer/export?format=${format}`;
  }

  // Masking Policies
  getPolicies() {
    return this.request('/policies');
  }

  getPolicy(id) {
    return this.request(`/policies/${id}`);
  }

  createPolicy(policyData) {
    return this.request('/policies', {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  }

  updatePolicy(id, policyData) {
    return this.request(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policyData)
    });
  }

  togglePolicy(id) {
    return this.request(`/policies/${id}/toggle`, {
      method: 'PATCH'
    });
  }

  previewPolicy(sampleValue, maskingMethod, dataCategory) {
    return this.request('/policies/preview', {
      method: 'POST',
      body: JSON.stringify({
        sample_value: sampleValue,
        masking_method: maskingMethod,
        data_category: dataCategory
      })
    });
  }

  // Query Playground
  getSampleQueries() {
    return this.request('/playground/samples');
  }

  executeQuery(payload) {
    return this.request('/playground/execute', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Audit Logs & Security
  getAuditLogs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/audit/logs${qs ? `?${qs}` : ''}`);
  }

  getSecurityEvents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/audit/security-events${qs ? `?${qs}` : ''}`);
  }

  resolveSecurityEvent(id) {
    return this.request(`/audit/security-events/${id}/resolve`, {
      method: 'PATCH'
    });
  }

  // Reports
  getReportSummary() {
    return this.request('/reports/summary');
  }

  getReportDownloadUrl(format = 'csv') {
    return `${BASE_URL}/reports/download?format=${format}`;
  }

  // CSV Upload
  uploadCsv(file, saveAsDataSource = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('save_as_datasource', saveAsDataSource);

    return this.request('/upload/csv', {
      method: 'POST',
      isFormData: true,
      body: formData
    });
  }

  // AI Intelligence & Machine Learning
  getAiModels() {
    return this.request('/ai/models');
  }

  trainAiModels() {
    return this.request('/ai/models/train', { method: 'POST' });
  }

  detectColumn(columnName, sampleValues) {
    return this.request('/ai/detect-column', {
      method: 'POST',
      body: JSON.stringify({ column_name: columnName, sample_values: sampleValues })
    });
  }

  scanText(text) {
    return this.request('/ai/scan-text', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  getTextSamples() {
    return this.request('/ai/scan-text/samples');
  }

  runAnomalyDetection() {
    return this.request('/ai/anomaly-detect', { method: 'POST' });
  }

  getPolicyRecommendations() {
    return this.request('/ai/recommendations');
  }

  approvePolicyRecommendation(id) {
    return this.request(`/ai/recommendations/${id}/approve`, { method: 'POST' });
  }

  rejectPolicyRecommendation(id, reason) {
    return this.request(`/ai/recommendations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  getPrivacyHeatmap() {
    return this.request('/ai/heatmap');
  }

  simulateExposure(payload) {
    return this.request('/ai/simulate-exposure', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  validatePolicies() {
    return this.request('/ai/validate-policies', { method: 'POST' });
  }

  generateSyntheticData(payload) {
    return this.request('/ai/generate-synthetic', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  queryAiAssistant(query) {
    return this.request('/ai/assistant/query', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  getComplianceEvidence() {
    return this.request('/ai/compliance');
  }

  getTokens() {
    return this.request('/ai/tokens');
  }

  createToken(value, category) {
    return this.request('/ai/tokens/tokenize', {
      method: 'POST',
      body: JSON.stringify({ value, category })
    });
  }

  detokenize(token, purpose) {
    return this.request('/ai/tokens/detokenize', {
      method: 'POST',
      body: JSON.stringify({ token, purpose })
    });
  }

  revokeToken(token, reason) {
    return this.request(`/ai/tokens/${token}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  encryptAesGcm(plaintext) {
    return this.request('/ai/crypto/encrypt', {
      method: 'POST',
      body: JSON.stringify({ plaintext })
    });
  }

  decryptAesGcm(ciphertext) {
    return this.request('/ai/crypto/decrypt', {
      method: 'POST',
      body: JSON.stringify({ ciphertext })
    });
  }

  getCryptoKeys() {
    return this.request('/ai/crypto/keys');
  }
}

export const api = new ApiService();
export default api;
