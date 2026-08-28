import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from '../../components/common/StatsCard';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  ShieldCheck,
  Star,
  Clock,
  Building,
  CheckCircle2,
  PieChart,
  Layers
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && token) {
      fetch(`${API_BASE}/api/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setData(resData);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user, token, authLoading]);

  const handleExport = () => {
    window.open(`${API_BASE}/api/analytics/export`, '_blank');
  };

  const metrics = data?.metrics || {
    total: 38,
    activeCount: 12,
    resolvedTotal: 26,
    avgResolutionHours: 21.4,
    slaComplianceRate: 97,
    avgRating: 4.8,
    ratingCount: 19
  };

  const deptStats = data?.departmentStats || [];
  const priorityStats = data?.priorityStats || { Critical: 2, High: 8, Medium: 20, Low: 8 };
  const statusDistribution = data?.statusDistribution || { Submitted: 4, 'Under Review': 3, Assigned: 2, 'In Progress': 3, Resolved: 16, Closed: 10 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-500/40">
              CAMPUS METRICS & CSAT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Grievance Analytics & SLA Performance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive resolution metrics, satisfaction scores, and department heatmaps.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-glow flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Full CSV Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Overall Resolution Rate"
          value={`${Math.round((metrics.resolvedTotal / (metrics.total || 1)) * 100)}%`}
          subtitle={`${metrics.resolvedTotal} of ${metrics.total} tickets resolved`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Avg Resolution Speed"
          value={`${metrics.avgResolutionHours}h`}
          subtitle="From lodge to fix verification"
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="SLA Compliance"
          value={`${metrics.slaComplianceRate}%`}
          subtitle="Fixed before SLA deadline"
          icon={ShieldCheck}
          color="purple"
        />
        <StatsCard
          title="Student CSAT Score"
          value={`⭐ ${metrics.avgRating}/5`}
          subtitle={`From ${metrics.ratingCount || 19} student reviews`}
          icon={Star}
          color="amber"
        />
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Volume & Resolution Rate */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Department Resolution Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400">Total volume</span>
          </div>

          <div className="space-y-3 pt-2">
            {deptStats.map((dept) => (
              <div key={dept.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate max-w-[200px]">{dept.name}</span>
                  <span className="text-slate-400">
                    <strong className="text-emerald-400">{dept.resolved} resolved</strong> / {dept.total} total
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${dept.resolutionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="space-y-6">
          {/* Priority Heatmap */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>Priority Level Distribution</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center">
                <p className="text-[10px] font-bold text-rose-300 uppercase">Critical (12h)</p>
                <h4 className="text-2xl font-extrabold text-rose-400 mt-1">{priorityStats.Critical || 0}</h4>
              </div>
              <div className="p-3 rounded-2xl bg-orange-950/40 border border-orange-500/30 text-center">
                <p className="text-[10px] font-bold text-orange-300 uppercase">High (24h)</p>
                <h4 className="text-2xl font-extrabold text-orange-400 mt-1">{priorityStats.High || 0}</h4>
              </div>
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center">
                <p className="text-[10px] font-bold text-amber-300 uppercase">Medium (72h)</p>
                <h4 className="text-2xl font-extrabold text-amber-400 mt-1">{priorityStats.Medium || 0}</h4>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                <p className="text-[10px] font-bold text-emerald-300 uppercase">Low (120h)</p>
                <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">{priorityStats.Low || 0}</h4>
              </div>
            </div>
          </div>

          {/* Status Pipeline */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Lifecycle Status Pipeline</span>
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 truncate">{status}</p>
                  <p className="text-lg font-extrabold text-white mt-0.5">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
