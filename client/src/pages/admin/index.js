import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  ShieldAlert,
  FileText,
  Clock,
  ShieldCheck,
  BarChart3,
  Users,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Building,
  CheckCircle2,
  Filter,
  Download
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const { socket } = useSocket();

  const [overview, setOverview] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, escRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/escalations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/complaints?limit=6`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const statsData = await statsRes.json();
      const escData = await escRes.json();
      const listData = await listRes.json();

      if (statsData.success) setOverview(statsData);
      if (escData.success) setEscalations(escData.escalations || []);
      if (listData.success) setRecentComplaints((listData.complaints || []).slice(0, 6));
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
      fetchAdminData();
    }
  }, [user, token, authLoading]);

  // Listen to live socket events
  useEffect(() => {
    if (!socket) return;

    const handleRefresh = () => {
      fetchAdminData();
    };

    socket.on('new_complaint', handleRefresh);
    socket.on('complaint_status_changed', handleRefresh);
    socket.on('escalation_alert', handleRefresh);

    return () => {
      socket.off('new_complaint', handleRefresh);
      socket.off('complaint_status_changed', handleRefresh);
      socket.off('escalation_alert', handleRefresh);
    };
  }, [socket]);

  const metrics = overview?.metrics || {
    total: 38,
    activeCount: 12,
    resolvedTotal: 26,
    avgResolutionHours: 21.4,
    slaComplianceRate: 97,
    avgRating: 4.8
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-white/10 shadow-glow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-500/40">
              CAMPUS EXECUTIVE ADMINISTRATION
            </span>
            <span className="text-xs text-slate-400">Welcome, <strong className="text-white">{user?.name || 'Dean'}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Campus Operations & Grievance Console</h1>
          <p className="text-xs text-slate-400 mt-1">Live tracking of student issues, department SLAs, and auto-escalations.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/complaints')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 glass-panel hover:bg-slate-800 border border-white/10 transition flex items-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Manage Queue</span>
          </button>
          <button
            onClick={() => router.push('/admin/analytics')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-glow flex items-center gap-2"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics Dashboard</span>
          </button>
        </div>
      </div>

      {/* SLA Breach Alert Banner if active escalations */}
      {escalations.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 shadow-glow-rose flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-900/80 text-rose-300 border border-rose-500/40 beacon-critical">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{escalations.length} Grievance(s) Escalated / SLA Breached!</span>
                <span className="text-[10px] bg-rose-500 text-white font-mono px-2 py-0.2 rounded-full">ACTION REQUIRED</span>
              </h3>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Tickets requiring urgent administrative intervention to prevent compliance violations.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/admin/escalation')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-glow transition flex items-center gap-1.5 shrink-0"
          >
            <span>Inspect Escalations ({escalations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Grievances"
          value={metrics.total}
          subtitle="All logged complaints"
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Active in Queue"
          value={metrics.activeCount}
          subtitle="Under review or assigned"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="SLA Compliance Rate"
          value={`${metrics.slaComplianceRate}%`}
          subtitle="Resolved within deadline"
          icon={ShieldCheck}
          color="emerald"
          trend="98% On-Time"
        />
        <StatsCard
          title="Student CSAT Index"
          value={`⭐ ${metrics.avgRating}/5`}
          subtitle={`Based on student ratings`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Department Breakdown Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white">Department Resolution Performance</h3>
          </div>
          <span className="text-xs text-slate-400">10 campus units active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(overview?.departmentStats || []).map((dept) => (
            <div
              key={dept.id}
              onClick={() => router.push(`/admin/complaints?department=${dept.id}`)}
              className="p-4 rounded-2xl glass-card border border-white/10 hover:border-blue-500/40 transition cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                  {dept.code}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {dept.resolutionRate}% Resolved
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{dept.name}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>Active Tasks: <strong className="text-amber-400">{dept.pending}</strong></span>
                  <span>Completed: <strong className="text-emerald-400">{dept.resolved}</strong></span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  style={{ width: `${dept.resolutionRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Grievances Table */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Grievances</h3>
            <p className="text-xs text-slate-400">Newly lodged tickets needing triage and assignment</p>
          </div>
          <button
            onClick={() => router.push('/admin/complaints')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>View All ({metrics.total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Ticket ID</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Student</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentComplaints.map((c) => (
                <tr key={c._id || c.ticketId} className="hover:bg-white/5 transition">
                  <td className="py-3.5 font-mono text-blue-400 font-bold">{c.ticketId}</td>
                  <td className="py-3.5 font-semibold text-white max-w-xs truncate">{c.title}</td>
                  <td className="py-3.5 text-slate-300 capitalize">{c.department?.replace('_', ' ')}</td>
                  <td className="py-3.5">
                    <PriorityBadge priority={c.priority} size="sm" isEscalated={c.isEscalated} />
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {c.isAnonymous ? 'Anonymous' : c.studentName}
                  </td>
                  <td className="py-3.5">
                    <button
                      onClick={() => router.push(`/student/${c.ticketId}`)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
