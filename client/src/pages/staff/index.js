import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  RefreshCw,
  Search
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function StaffDashboard() {
  const router = useRouter();
  const { user, token, isStaff, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useNotifications();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterView, setFilterView] = useState('my'); // 'my' or 'all_dept'

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStaffComplaints = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const dept = user?.assignedDepartment || '';
      const params = new URLSearchParams();
      if (filterView === 'my') {
        params.append('assignedStaffId', user._id);
      } else if (dept) {
        params.append('department', dept);
      }

      const res = await fetch(`${API_BASE}/api/admin/complaints?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      }
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
      fetchStaffComplaints();
    }
  }, [user, token, authLoading, filterView]);

  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const assignedCount = complaints.filter(c => c.status === 'Assigned' || c.status === 'Submitted').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Staff Header */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-glow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-500/40">
              DEPARTMENT OPERATIONS DESK
            </span>
            <span className="text-xs text-slate-400">Unit: <strong className="text-white">{user?.department || 'Operations Staff'}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Staff Work Queue: {user?.name || 'Staff Member'} 🛠️
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect assigned campus grievances, provide status updates, and submit resolution proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterView(filterView === 'my' ? 'all_dept' : 'my')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 glass-panel border border-white/10 hover:bg-slate-800 transition"
          >
            {filterView === 'my' ? 'Switch to Entire Dept Queue' : 'Switch to My Assigned Only'}
          </button>
          <button
            onClick={fetchStaffComplaints}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Tasks"
          value={complaints.length}
          subtitle="In current queue"
          icon={Briefcase}
          color="blue"
        />
        <StatsCard
          title="To Do / Assigned"
          value={assignedCount}
          subtitle="Awaiting technician dispatch"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Currently being fixed"
          icon={Wrench}
          color="purple"
        />
        <StatsCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Completed tasks"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Tasks Table */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {filterView === 'my' ? 'My Assigned Tasks' : `All ${user?.department || 'Department'} Grievances`}
          </h3>
          <span className="text-xs text-slate-400">{complaints.length} task(s) found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Ticket ID</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Student</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No active tasks assigned to your queue at the moment.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id || c.ticketId} className="hover:bg-white/5 transition">
                    <td className="py-3.5 font-mono text-blue-400 font-bold">{c.ticketId}</td>
                    <td className="py-3.5 max-w-xs">
                      <p className="font-semibold text-white truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.description}</p>
                    </td>
                    <td className="py-3.5 text-slate-300 truncate max-w-[150px]">{c.location || 'Campus'}</td>
                    <td className="py-3.5">
                      <PriorityBadge priority={c.priority} size="sm" isEscalated={c.isEscalated} />
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {c.isAnonymous ? 'Anonymous' : c.studentName}
                    </td>
                    <td className="py-3.5 flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition flex items-center gap-1"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Update Fix</span>
                      </button>
                      <button
                        onClick={() => router.push(`/student/${c.ticketId}`)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                        title="View Details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            showToast({ title: 'Task Updated', message: `Status updated to ${statusData.status}`, type: 'success' });
            fetchStaffComplaints();
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
            showToast({ title: 'Task Assigned', message: 'Assigned successfully', type: 'info' });
            fetchStaffComplaints();
          }
        }}
        complaint={selectedComplaint}
        staffList={[]}
      />
    </div>
  );
}
