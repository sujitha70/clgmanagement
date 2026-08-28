import React from 'react';

export const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, isAlert = false }) => {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30'
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${selectedColor} border backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${isAlert ? 'beacon-critical' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-white/10 text-white shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span className="font-semibold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
