import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, UserCheck, Wrench } from 'lucide-react';

const STATUS_OPTIONS = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed'
];

export const StatusUpdateModal = ({
  isOpen,
  onClose,
  onUpdateStatus,
  onAssignStaff,
  complaint,
  staffList = []
}) => {
  const [targetStatus, setTargetStatus] = useState(complaint?.status || 'In Progress');
  const [selectedStaffId, setSelectedStaffId] = useState(complaint?.assignedStaffId || '');
  const [note, setNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState(complaint?.resolutionDetails?.resolutionNotes || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. If staff changed
      if (selectedStaffId && selectedStaffId !== complaint.assignedStaffId) {
        await onAssignStaff({
          assignedStaffId: selectedStaffId,
          department: complaint.department,
          note: note || `Assigned to staff specialist.`
        });
      }

      // 2. If status changed or resolution notes added
      if (targetStatus !== complaint.status || resolutionNotes || targetStatus === 'Resolved') {
        await onUpdateStatus({
          status: targetStatus,
          note: note || `Status transitioned to ${targetStatus}.`,
          resolutionNotes: targetStatus === 'Resolved' ? resolutionNotes : undefined
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-lg w-full glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
              {complaint.ticketId}
            </span>
            <span className="text-xs text-slate-400">Manage Status & Staff Assignment</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 line-clamp-1">{complaint.title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Status Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              Update Lifecycle Status
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl glass-input bg-slate-900 border-white/10 focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Assign Department Staff */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Assign Department Staff Member
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl glass-input bg-slate-900 border-white/10 focus:outline-none"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                -- Keep Unassigned or Department Queue --
              </option>
              {staffList.map((st) => (
                <option key={st._id} value={st._id} className="bg-slate-900 text-white">
                  {st.name} ({st.department || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          {/* Resolution details if setting to Resolved */}
          {targetStatus === 'Resolved' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <label className="block text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Resolution Notes & Fix Proof
              </label>
              <textarea
                rows={3}
                required
                placeholder="Detail the actions taken to resolve this grievance (e.g. replaced router, repaired tap, fee reversed)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg glass-input bg-slate-950/80 placeholder-slate-500 border-emerald-500/30 focus:outline-none"
              />
            </div>
          )}

          {/* Transition / Update Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-400" />
              Audit Trail Note (Visible to Student)
            </label>
            <input
              type="text"
              placeholder="e.g. Technician dispatched / Parts ordered..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-glow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Updating...' : 'Save & Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
