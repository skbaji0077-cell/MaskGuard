import React from 'react';

export default function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendPositive,
  accent = 'cyan',
  badge
}) {
  const accentGradients = {
    cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    rose: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400',
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400'
  };

  const currentGradient = accentGradients[accent] || accentGradients.cyan;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0D1527]/80 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 p-5 group hover:shadow-xl hover:shadow-cyan-950/20">
      {/* Subtle background glow */}
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${currentGradient} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-800 ${currentGradient} group-hover:scale-110 transition-transform`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-slate-100">
          {value}
        </div>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {badge}
          </span>
        )}
      </div>

      {(subvalue || trend) && (
        <div className="mt-2 flex items-center space-x-2 text-xs">
          {trend && (
            <span className={`font-semibold flex items-center ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
          )}
          {subvalue && (
            <span className="text-slate-400 truncate">{subvalue}</span>
          )}
        </div>
      )}
    </div>
  );
}
