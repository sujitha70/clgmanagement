import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import { useNotifications } from '../../context/NotificationContext';
import {
  ShieldAlert,
  Clock,
  ArrowRight,
  User,
  Wrench,
  AlertTriangle,
  Building,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EscalationDeskPage() {
  const router = useRouter();
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useNotifications();

  const [escalations, setEscalations] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEscalations = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [escRes, staffRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/escalations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/staff`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const escData = await escRes.json();
      const staffData = await staffRes.json();

      if (escData.success) setEscalations(escData.escalations || []);
      if (staffData.success) setStaffList(staffData.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchEscalations();
    }
  }, [user, token, authLoading]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border border-rose-500/40 shadow-glow-rose space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 beacon-critical">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
            Critical SLA & Escalation Control Desk
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Escalated Grievances Requiring Urgent Action</h1>
        <p className="text-xs text-rose-200/80 max-w-2xl">
          Complaints flagged with Critical Priority (safety hazard) or exceeding SLA resolution deadlines are routed here for immediate administrative intervention and direct staff dispatch.
        </p>
      </div>

      {/* Escalation Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(n => (
            <div key={n} className="h-44 rounded-2xl glass-card border border-white/5 animate-shimmer" />
          ))}
        </div>
      ) : escalations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-white/5 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Zero Active Escalations!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All campus grievances are currently within SLA compliance deadlines and well-handled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escalations.map((cmp) => (
            <div
              key={cmp._id || cmp.ticketId}
              className="p-6 rounded-3xl glass-card border border-rose-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 shadow-xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-500/50">
                    {cmp.ticketId}
                  </span>
                  <StatusBadge status={cmp.status} />
                  <PriorityBadge priority={cmp.priority} isEscalated={true} />
                </div>

                <span className="text-[10px] font-mono text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded font-bold">
                  SLA CRITICAL
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{cmp.title}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{cmp.description}</p>
              </div>

              {cmp.escalationReason && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-[11px] text-rose-200">
                  <strong className="text-white">Escalation Cause:</strong> {cmp.escalationReason}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-white/5 pt-3">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-bold">Department</span>
                  <span className="text-white font-semibold capitalize">{cmp.department?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-bold">Location</span>
                  <span className="text-white font-semibold truncate block">{cmp.location || 'Campus'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedComplaint(cmp);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:opacity-90 transition shadow-glow flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Immediate Triage / Assign</span>
                </button>
                <button
                  onClick={() => router.push(`/student/${cmp.ticketId}`)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white glass-panel border border-white/10"
                  title="View Full Ticket"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <StatusUpdateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
        }}
        onUpdateStatus={async (statusData) => {
          const res = await fetch(`${API_BASE}/api/complaints/${selectedComplaint._id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(statusData)
          });
          const data = await res.json();
          if (data.success) {
            showToast({ title: 'Status Updated', message: `Ticket updated to ${statusData.status}`, type: 'success' });
            fetchEscalations();
          }
        }}
        onAssignStaff={async (assignData) => {
          const res = await fetch(`${API_BASE}/api/complaints/${selectedComplaint._id}/assign`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(assignData)
          });
          const data = await res.json();
          if (data.success) {
            showToast({ title: 'Staff Assigned', message: 'Task assigned successfully.', type: 'info' });
            fetchEscalations();
          }
        }}
        complaint={selectedComplaint}
        staffList={staffList}
      />
    </div>
  );
}
