import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { StatsCard } from '../../components/common/StatsCard';
import {
  PlusCircle,
  FileText,
  Clock,
  ShieldCheck,
  CheckCheck,
  Search,
  Filter,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { socket } = useSocket();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMyComplaints = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/complaints/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to fetch student complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMyComplaints();
    }
  }, [user, token, authLoading]);

  // Listen to socket status change
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchMyComplaints();
    };

    socket.on('complaint_status_changed', handleUpdate);
    socket.on('new_complaint', handleUpdate);

    return () => {
      socket.off('complaint_status_changed', handleUpdate);
      socket.off('new_complaint', handleUpdate);
    };
  }, [socket]);

  // Calculations for stats cards
  const totalFiled = complaints.length;
  const activeCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && c.status !== 'Resolved' && c.status !== 'Closed') ||
      c.status === filterStatus;

    const matchesSearch = !searchQuery ||
      c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 shadow-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              STUDENT PORTAL
            </span>
            <span className="text-xs text-slate-400">Roll: <strong className="text-white">{user?.rollNumber || 'CS-2023-014'}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.department || 'Computer Science & Engineering'} • {user?.hostelBlock || 'Kaveri Hostel'} {user?.roomNumber ? `(${user.roomNumber})` : ''}
          </p>
        </div>

        <button
          onClick={() => router.push('/student/new')}
          className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-glow transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lodge New Grievance</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Lodged"
          value={totalFiled}
          subtitle="All-time grievances"
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Assigned & being repaired"
          icon={Clock}
          color="purple"
        />
        <StatsCard
          title="Active Pending"
          value={activeCount}
          subtitle="Awaiting resolution"
          icon={AlertCircle}
          color="amber"
        />
        <StatsCard
          title="Resolved & Closed"
          value={resolvedCount}
          subtitle="Successfully fixed"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Complaints Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5 overflow-x-auto">
            {['all', 'active', 'Submitted', 'In Progress', 'Resolved', 'Closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filterStatus === tab
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Tickets' : tab === 'active' ? 'Active' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search my grievances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-44 rounded-2xl glass-card border border-white/5 animate-shimmer" />
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-white/5 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No grievances found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? 'No grievances matched your search or status filter.'
                : "You haven't filed any grievances yet. If you are facing any campus issue, lodge a ticket now."}
            </p>
            <button
              onClick={() => router.push('/student/new')}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-glow inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Lodge Grievance
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id || complaint.ticketId}
                complaint={complaint}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
