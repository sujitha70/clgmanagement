import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ShieldAlert,
  BarChart3,
  Users,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, isStaff, isStudent } = useAuth();
  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  const studentLinks = [
    { label: 'My Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'Lodge New Grievance', href: '/student/new', icon: PlusCircle, highlight: true },
    { label: 'All My Complaints', href: '/student', icon: FileText },
  ];

  const staffLinks = [
    { label: 'Department Queue', href: '/staff', icon: LayoutDashboard },
    { label: 'Knowledge Base', href: '/student', icon: HelpCircle }
  ];

  const adminLinks = [
    { label: 'Master Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'All Grievances', href: '/admin/complaints', icon: FileText },
    { label: 'SLA Escalations', href: '/admin/escalation', icon: ShieldAlert, badge: 'SLA' },
    { label: 'Analytics & CSAT', href: '/admin/analytics', icon: BarChart3 }
  ];

  const links = isAdmin ? adminLinks : isStaff ? staffLinks : studentLinks;

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between p-4 border-r border-white/10 bg-slate-950/40 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Navigation</p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <button
                  key={link.label}
                  onClick={() => router.push(link.href)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-glow'
                      : link.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-glow hover:opacity-90'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : ''}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Triage Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-purple-950/30 border border-indigo-500/20">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Triage Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Automatic department detection, priority assignment & duplicate protection are running live.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-400">CampusResolve v1.0</p>
        <p>Enterprise Grievance Portal</p>
      </div>
    </aside>
  );
};
