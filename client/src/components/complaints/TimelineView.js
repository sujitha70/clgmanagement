import React from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  AlertCircle,
  User,
  Shield,
  Wrench
} from 'lucide-react';

const STATUS_STEPS = [
  { id: 'Submitted', label: 'Submitted', icon: Clock },
  { id: 'Under Review', label: 'Under Review', icon: AlertCircle },
  { id: 'Assigned', label: 'Assigned', icon: ArrowRight },
  { id: 'In Progress', label: 'In Progress', icon: Wrench },
  { id: 'Resolved', label: 'Resolved', icon: ShieldCheck },
  { id: 'Closed', label: 'Closed', icon: CheckCheck }
];

export const TimelineView = ({ status, timeline = [] }) => {
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === status);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      case 'staff':
        return <Wrench className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Lifecycle Stepper */}
      <div className="p-5 rounded-2xl glass-card border border-white/10">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
          Resolution Lifecycle Flow
        </h4>

        <div className="relative flex items-center justify-between">
          {/* Progress bar background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
          {/* Active progress bar */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`
            }}
          />

          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110 shadow-glow'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 border border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`mt-2 text-[10px] font-bold text-center tracking-tight hidden sm:block ${
                    isCurrent ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Audit Trail */}
      <div className="p-5 rounded-2xl glass-card border border-white/10">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Audit Trail & Timeline History
        </h4>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {timeline.length === 0 ? (
            <p className="text-xs text-slate-500 pl-8">No historical activity logged yet.</p>
          ) : (
            timeline.map((entry, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-1">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-blue-500/40 flex items-center justify-center text-blue-400 z-10 shadow-sm">
                  {getRoleIcon(entry.role)}
                </div>

                <div className="flex-1 p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{entry.updatedBy}</span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {entry.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    Status: <span className="text-white">{entry.status}</span>
                  </div>

                  {entry.note && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-white/5 mt-1">
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
