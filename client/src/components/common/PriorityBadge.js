import React from 'react';
import { Flame, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export const PriorityBadge = ({ priority, size = 'sm', isEscalated = false }) => {
  const configs = {
    'Critical': {
      bg: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
      icon: Flame,
      glow: 'shadow-glow-rose'
    },
    'High': {
      bg: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
      icon: AlertTriangle,
      glow: ''
    },
    'Medium': {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: Info,
      glow: ''
    },
    'Low': {
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: Info,
      glow: ''
    }
  };

  const config = configs[priority] || configs['Medium'];
  const Icon = config.icon;

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1 text-sm font-semibold'
    : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 rounded-md border ${config.bg} ${config.glow} ${sizeClasses}`}>
        <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
        {priority}
      </span>
      {isEscalated && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-500/50 rounded-md beacon-critical">
          <ShieldAlert className="w-3 h-3 text-rose-400" />
          ESCALATED
        </span>
      )}
    </div>
  );
};
