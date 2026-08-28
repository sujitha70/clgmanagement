import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, ArrowRight, Zap, ShieldAlert, FileText } from 'lucide-react';
import { PriorityBadge } from '../common/PriorityBadge';

export const AIAssistantWidget = ({
  analysis,
  loading = false,
  onApplyCategory,
  onApplyPriority,
  onViewDuplicate
}) => {
  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-md animate-pulse">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <Sparkles className="w-4 h-4 animate-spin text-indigo-300" />
          <span>AI Engine analyzing description...</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Predicting department, urgency & checking for duplicates...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 shadow-glow backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">CampusResolve AI Triage</h4>
            <p className="text-[10px] text-slate-400">Real-time intelligent routing & classification</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px]">
          <span className="text-slate-400 font-semibold">Urgency:</span>
          <span className={`font-mono font-bold ${
            analysis.urgencyScore >= 80 ? 'text-rose-400' : analysis.urgencyScore >= 50 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {analysis.urgencyScore || 50}/100
          </span>
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {analysis.isPotentialDuplicate && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-start gap-2.5 text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px]">
            <p className="font-bold text-amber-300">
              Potential Duplicate Issue Detected ({analysis.duplicateSimilarity}% match)
            </p>
            <p className="text-amber-200/80 mt-0.5">
              An active grievance with similar details is already filed:
              <span className="font-semibold text-white ml-1">"{analysis.matchedComplaintTitle || analysis.duplicateTicketId}"</span>
            </p>
            {analysis.duplicateTicketId && onViewDuplicate && (
              <button
                type="button"
                onClick={() => onViewDuplicate(analysis.duplicateTicketId)}
                className="mt-2 inline-flex items-center gap-1 font-bold text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-1 rounded border border-amber-500/40 transition"
              >
                <ArrowRight className="w-3 h-3" />
                View Existing Ticket {analysis.duplicateTicketId}
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Suggestions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Suggested Department */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Department</p>
            <p className="text-xs font-bold text-white mt-0.5 capitalize">
              {analysis.suggestedCategory ? analysis.suggestedCategory.replace('_', ' ') : 'General'}
            </p>
          </div>
          {onApplyCategory && (
            <button
              type="button"
              onClick={() => onApplyCategory(analysis.suggestedCategory)}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              Apply
            </button>
          )}
        </div>

        {/* Suggested Priority */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Priority</p>
            <div className="mt-0.5">
              <PriorityBadge priority={analysis.suggestedPriority || 'Medium'} size="sm" />
            </div>
          </div>
          {onApplyPriority && (
            <button
              type="button"
              onClick={() => onApplyPriority(analysis.suggestedPriority)}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              Apply
            </button>
          )}
        </div>
      </div>

      {/* Auto Summary */}
      {analysis.summary && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <FileText className="w-3 h-3 text-slate-400" />
            <span>AI Executive Summary</span>
          </div>
          <p className="text-xs text-slate-300 italic font-mono">
            "{analysis.summary}"
          </p>
        </div>
      )}
    </div>
  );
};
