import React from 'react';
import { useRouter } from 'next/router';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  MapPin,
  Calendar,
  User,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Sparkles,
  Paperclip
} from 'lucide-react';

export const ComplaintCard = ({ complaint, onActionClick, showActions = false }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/student/${complaint.ticketId}`);
  };

  // Calculate SLA remaining hours
  const calculateSLARemaining = () => {
    if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
      return null;
    }
    if (!complaint.slaDeadline) return null;

    const remainingMs = new Date(complaint.slaDeadline).getTime() - Date.now();
    const remainingHours = Math.round(remainingMs / 3600000);

    if (remainingHours <= 0) {
      return { text: `SLA Breached (${Math.abs(remainingHours)}h overdue)`, isOverdue: true };
    }
    return { text: `${remainingHours}h remaining in SLA`, isOverdue: false };
  };

  const slaInfo = calculateSLARemaining();

  return (
    <div
      onClick={handleCardClick}
      className="group relative p-5 rounded-2xl glass-card border border-white/10 hover:border-blue-500/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-glow flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
              {complaint.ticketId}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} isEscalated={complaint.isEscalated} />
          </div>

          <div className="p-1 rounded-lg text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Title & Description */}
        <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition line-clamp-1">
          {complaint.title}
        </h4>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & Meta info */}
        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-slate-400 border-t border-white/5 pt-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate max-w-[150px]">{complaint.location || 'Main Campus'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{complaint.isAnonymous ? 'Anonymous' : (complaint.studentName || 'Student')}</span>
          </div>

          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
              <Paperclip className="w-3 h-3" />
              <span>{complaint.attachments.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Details & SLA */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {complaint.assignedStaffName ? (
            <span className="text-[11px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
              👤 {complaint.assignedStaffName}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
              Unassigned
            </span>
          )}

          {complaint.feedback?.rating && (
            <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {complaint.feedback.rating}/5
            </span>
          )}
        </div>

        {slaInfo && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              slaInfo.isOverdue
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            {slaInfo.text}
          </span>
        )}
      </div>
    </div>
  );
};
