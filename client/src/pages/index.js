import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  BarChart3,
  Users,
  Shield,
  Layers,
  HeartHandshake
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const router = useRouter();
  const { user, demoLogin } = useAuth();
  const [trackTicketId, setTrackTicketId] = useState('');
  const [stats, setStats] = useState({
    total: 38,
    resolvedTotal: 34,
    avgResolutionHours: 18.5,
    slaComplianceRate: 98,
    avgRating: 4.9
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/overview`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.metrics) {
          setStats(data.metrics);
        }
      })
      .catch(() => {});
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackTicketId.trim()) {
      router.push(`/student/${trackTicketId.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold animate-shimmer">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>Next-Gen AI-Assisted College Grievance Resolution Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Resolve Campus Grievances with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Speed, Transparency & AI</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Empowering students to lodge complaints across hostel, academics, IT, mess, and infrastructure with real-time SLA tracking, automated department routing, and instant administrative escalation.
        </p>

        {/* Quick Ticket Tracker Card */}
        <div className="max-w-xl mx-auto p-2 sm:p-3 rounded-2xl glass-card border border-white/10 shadow-glow">
          <form onSubmit={handleTrackSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Ticket ID (e.g. CMP-2026-1001)..."
                value={trackTicketId}
                onChange={(e) => setTrackTicketId(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl glass-input placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition shadow-glow flex items-center gap-1.5 shrink-0"
            >
              <span>Track Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => router.push('/student/new')}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition shadow-glow flex items-center gap-2"
          >
            <span>Lodge a Grievance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white glass-panel hover:bg-slate-800 transition border border-white/10"
          >
            Sign In to Portal
          </button>
        </div>
      </section>

      {/* Live Campus Resolution Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="p-5 rounded-2xl glass-card border border-white/10 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Grievances</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">{stats.total || 42}</h3>
          <span className="text-[11px] text-blue-400 mt-1 inline-block">100% Audit Tracked</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved & Closed</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.resolvedTotal || 38}</h3>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block">92% Resolution Rate</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Resolution Time</p>
          <h3 className="text-3xl font-extrabold text-indigo-400 mt-1">{stats.avgResolutionHours || 18}h</h3>
          <span className="text-[11px] text-indigo-300 mt-1 inline-block">Fast SLA Turnaround</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Satisfaction</p>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-1">⭐ {stats.avgRating || 4.9}/5</h3>
          <span className="text-[11px] text-amber-300 mt-1 inline-block">Based on student CSAT</span>
        </div>
      </section>

      {/* Instant Demo Roles Grid */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Experience Role Portals in One-Click</h2>
          <p className="text-xs text-slate-400 mt-1">Instant login test accounts pre-configured for evaluation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">Student Portal</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Lodge grievances with photo proof, watch live AI department categorization, receive real-time timeline notifications, and rate resolution satisfaction.
              </p>
            </div>
            <button
              onClick={() => demoLogin('student')}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 transition flex items-center justify-center gap-2"
            >
              <span>Login as Aarav (Student)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Department Staff */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">Department Staff</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Specialized view for Hostel Wardens, Network Engineers, and Maintenance staff to inspect tasks, update statuses to In Progress, and record resolution notes.
              </p>
            </div>
            <button
              onClick={() => demoLogin('staff.wifi')}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 transition flex items-center justify-center gap-2"
            >
              <span>Login as Sneha (IT Staff)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Administrator */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col justify-between hover:border-rose-500/40 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition">Dean & Administration</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Master oversight across all campus departments, SLA breach monitoring, automated escalation, bulk ticket assignments, and CSAT visual analytics.
              </p>
            </div>
            <button
              onClick={() => demoLogin('admin')}
              className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 transition flex items-center justify-center gap-2"
            >
              <span>Login as Dr. Sundaram (Dean)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Key Architectural Highlights */}
      <section className="max-w-5xl mx-auto p-8 rounded-3xl glass-card border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white">Engineered for Academic Excellence</h2>
          <p className="text-xs text-slate-400 mt-1">Built strictly to campus specifications with full resilience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI Triage & Deduplication</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-detects department, determines urgency score, generates summaries, and warns students of duplicate tickets before lodging.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>SLA Escalation Engine</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates dynamic SLA deadlines (12h Critical, 24h High, 72h Medium) and automatically escalates overdue tickets to the Principal.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Real-Time WebSockets</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Socket.IO bi-directional streaming provides instant sound chimes, live badge updates, and public/internal discussion threads.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
