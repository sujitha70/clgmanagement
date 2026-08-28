import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import {
  Search,
  Filter,
  Download,
  CheckSquare,
  Square,
  ArrowRight,
  Wrench,
  Sparkles,
  Calendar,
  Building,
  RefreshCw,
  CheckCircle2,
  Trash2
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEPARTMENTS = [
  { id: 'all', name: 'All Departments' },
  { id: 'wifi_it', name: 'IT & Wi-Fi' },
  { id: 'hostel', name: 'Hostel' },
  { id: 'mess', name: 'Mess' },
  { id: 'academics', name: 'Academics' },
  { id: 'infrastructure', name: 'Infrastructure' },
  { id: 'library', name: 'Library' },
  { id: 'accounts', name: 'Accounts' },
  { id: 'transport', name: 'Transport' },
  { id: 'sanitation', name: 'Sanitation' }
];

const STATUSES = ['all', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['all', 'Low', 'Medium', 'High', 'Critical'];

export default function AdminComplaintsPage() {
  const router = useRouter();
  const { user, token, isAdmin, isStaff, loading: authLoading } = useAuth();
  const { showToast } = useNotifications();

  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('In Progress');
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Single modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComplaints = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (deptFilter !== 'all') params.append('department', deptFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

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

  const fetchStaff = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStaffList(data.staff || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchComplaints();
      fetchStaff();
    }
  }, [user, token, authLoading, deptFilter, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === complaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(complaints.map(c => c.ticketId));
    }
  };

  const toggleSelect = (tid) => {
    setSelectedIds(prev =>
      prev.includes(tid) ? prev.filter(id => id !== tid) : [...prev, tid]
    );
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bulk-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ticketIds: selectedIds,
          status: bulkStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast({ title: 'Bulk Updated', message: `Updated ${selectedIds.length} tickets to ${bulkStatus}`, type: 'success' });
        setSelectedIds([]);
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleExportCSV = async () => {
    if (!token) return;
    window.open(`${API_BASE}/api/analytics/export`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Grievances Queue & Triage Desk</h1>
          <p className="text-xs text-slate-400">Search, filter, bulk transition, and assign campus tickets</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchComplaints}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keyword, student, roll no, location, or ticket ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-glow shrink-0"
          >
            Filter
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full p-2 text-xs rounded-xl glass-input bg-slate-900 focus:outline-none"
            >
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status Flow</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 text-xs rounded-xl glass-input bg-slate-900 focus:outline-none"
            >
              {STATUSES.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s === 'all' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 text-xs rounded-xl glass-input bg-slate-900 focus:outline-none"
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p} className="bg-slate-900 text-white">{p === 'all' ? 'All Priorities' : `${p} Priority`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls Bar if any selected */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 shadow-glow flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span>{selectedIds.length} ticket(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="p-1.5 text-xs rounded-lg glass-input bg-slate-900 border-white/10"
            >
              {STATUSES.filter(s => s !== 'all').map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">Mark as {s}</option>
              ))}
            </select>
            <button
              onClick={handleBulkStatusUpdate}
              disabled={bulkProcessing}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-glow flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{bulkProcessing ? 'Applying...' : 'Apply Bulk Update'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 w-8">
                  <button onClick={toggleSelectAll} className="p-1 text-slate-400 hover:text-white">
                    {selectedIds.length === complaints.length && complaints.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="pb-3">Ticket ID</th>
                <th className="pb-3">Title & Summary</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Assigned Staff</th>
                <th className="pb-3">Student</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No complaints matched the active filters.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const isSelected = selectedIds.includes(c.ticketId);
                  return (
                    <tr
                      key={c._id || c.ticketId}
                      className={`hover:bg-white/5 transition ${isSelected ? 'bg-indigo-950/20' : ''}`}
                    >
                      <td className="py-3.5">
                        <button onClick={() => toggleSelect(c.ticketId)} className="p-1 text-slate-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 font-mono text-blue-400 font-bold whitespace-nowrap">
                        {c.ticketId}
                      </td>
                      <td className="py-3.5 max-w-xs">
                        <p className="font-semibold text-white truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{c.location || 'Campus'}</p>
                      </td>
                      <td className="py-3.5 text-slate-300 capitalize whitespace-nowrap">
                        {c.department?.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} size="sm" isEscalated={c.isEscalated} />
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3.5 text-slate-400 whitespace-nowrap">
                        {c.assignedStaffName ? (
                          <span className="text-indigo-300 font-semibold">{c.assignedStaffName}</span>
                        ) : (
                          <span className="text-slate-500">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-400 whitespace-nowrap">
                        {c.isAnonymous ? 'Anonymous' : c.studentName}
                      </td>
                      <td className="py-3.5 whitespace-nowrap flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 transition flex items-center gap-1"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Triage</span>
                        </button>
                        <button
                          onClick={() => router.push(`/student/${c.ticketId}`)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                          title="View Full Ticket"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
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
            showToast({ title: 'Status Updated', message: `Ticket updated to ${statusData.status}`, type: 'success' });
            fetchComplaints();
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
            fetchComplaints();
          }
        }}
        complaint={selectedComplaint}
        staffList={staffList}
      />
    </div>
  );
}
