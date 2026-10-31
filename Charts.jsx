import React from 'react';

// Color map for PII categories
const CATEGORY_COLORS = {
  CREDIT_CARD: '#F43F5E', // Rose
  PAN_IN: '#EC4899', // Pink
  EMAIL: '#06B6D4', // Cyan
  PHONE: '#3B82F6', // Blue
  BANK_ACCOUNT: '#8B5CF6', // Purple
  NAME: '#10B981', // Emerald
  CUSTOMER_ID: '#F59E0B', // Amber
  AADHAAR_IN: '#6366F1', // Indigo
  IFSC_CODE: '#14B8A6', // Teal
  SSN: '#EF4444', // Red
  DOB: '#A855F7', // Violet
  FINANCIAL: '#EAB308' // Yellow
};

/**
 * Donut chart for PII Findings by Category
 */
export function CategoryDonutChart({ data = {} }) {
  const entries = Object.entries(data);
  const total = entries.reduce((acc, [, val]) => acc + val, 0);

  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
        No PII findings discovered yet
      </div>
    );
  }

  // Calculate SVG stroke dashes
  let cumulativePercent = 0;
  const segments = entries.map(([category, count]) => {
    const percent = count / total;
    const strokeDasharray = `${percent * 100} ${100 - percent * 100}`;
    const strokeDashoffset = -cumulativePercent * 100;
    cumulativePercent += percent;
    return {
      category,
      count,
      percent: Math.round(percent * 100),
      color: CATEGORY_COLORS[category] || '#64748B',
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative w-40 h-40 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#1E293B"
            strokeWidth="3.5"
          />
          {segments.map((seg) => (
            <circle
              key={seg.category}
              cx="18"
              cy="18"
              r="15.91549430918954"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="3.5"
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              className="transition-all duration-500 hover:opacity-80"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-slate-100">{total}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">PII Fields</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 grid grid-cols-2 gap-2 text-xs w-full">
        {segments.map((seg) => (
          <div key={seg.category} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="truncate text-slate-300 font-medium">{seg.category}</span>
            </div>
            <span className="font-semibold text-slate-100 ml-2">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Bar chart for Severity distribution
 */
export function SeverityDistributionBar({ counts = {} }) {
  const severities = [
    { key: 'CRITICAL', label: 'Critical', color: 'from-rose-500 to-red-600', text: 'text-rose-400' },
    { key: 'HIGH', label: 'High', color: 'from-amber-500 to-orange-600', text: 'text-amber-400' },
    { key: 'MEDIUM', label: 'Medium', color: 'from-blue-500 to-cyan-600', text: 'text-cyan-400' },
    { key: 'LOW', label: 'Low', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-400' }
  ];

  const total = severities.reduce((acc, s) => acc + (counts[s.key] || 0), 0);

  return (
    <div className="space-y-3">
      {severities.map((s) => {
        const count = counts[s.key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={s.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">{s.label}</span>
              <span className="text-slate-400">
                <span className={`font-semibold ${s.text}`}>{count}</span> ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${s.color} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Scan activity timeline sparkline
 */
export function ScanActivitySparkline({ scans = [] }) {
  if (scans.length === 0) {
    return <div className="text-slate-500 text-xs py-4 text-center">No scan activity recorded yet</div>;
  }

  const recentScans = scans.slice(0, 10).reverse();
  const maxFindings = Math.max(...recentScans.map(s => s.pii_fields_detected || 1), 5);

  return (
    <div className="space-y-2">
      <div className="h-24 flex items-end justify-between gap-1 pt-4">
        {recentScans.map((scan, idx) => {
          const heightPct = Math.max(15, Math.round(((scan.pii_fields_detected || 0) / maxFindings) * 100));
          return (
            <div key={scan.id || idx} className="flex-1 flex flex-col items-center group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-[10px] text-slate-200 px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                {scan.pii_fields_detected} fields • {new Date(scan.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div
                className="w-full rounded-t bg-gradient-to-t from-cyan-600 to-blue-400 group-hover:from-cyan-400 group-hover:to-cyan-200 transition-all duration-300"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>Earliest recent scan</span>
        <span>Latest scan</span>
      </div>
    </div>
  );
}
