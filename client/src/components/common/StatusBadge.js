import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, CheckCheck } from 'lucide-react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const configs = {
    'Submitted': {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: Clock,
      dot: 'bg-amber-400'
    },
    'Under Review': {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: AlertCircle,
      dot: 'bg-blue-400'
    },
    'Assigned': {
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      icon: ArrowRight,
      dot: 'bg-indigo-400'
    },
    'In Progress': {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: Clock,
      dot: 'bg-purple-400'
    },
    'Resolved': {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      dot: 'bg-emerald-400'
    },
    'Closed': {
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      icon: CheckCheck,
      dot: 'bg-slate-400'
    }
  };

  const config = configs[status] || configs['Submitted'];
  const Icon = config.icon;

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1 text-sm font-semibold'
    : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`} />
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {status}
    </span>
  );
};
