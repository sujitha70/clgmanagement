import React, { useState } from 'react';
import Link from 'next/router';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  GraduationCap,
  Bell,
  Search,
  LogOut,
  User,
  Shield,
  Briefcase,
  ChevronDown,
  Sparkles,
  Zap
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, demoLogin, isAdmin, isStaff, isStudent } = useAuth();
  const { connected } = useSocket();
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const router = useRouter();

  const [searchTicket, setSearchTicket] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTicket.trim()) {
      router.push(`/student/${searchTicket.trim().toUpperCase()}`);
      setSearchTicket('');
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">ADMIN CONSOLE</span>;
    if (isStaff) return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">DEPT STAFF</span>;
    return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">STUDENT PORTAL</span>;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(isAdmin ? '/admin' : isStaff ? '/staff' : isStudent ? '/student' : '/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-glow">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">Campus<span className="text-blue-400">Resolve</span></span>
              {getRoleBadge()}
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">AI-Assisted Grievance & SLA Tracking</p>
          </div>
        </div>

        {/* Quick Ticket Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Track Ticket (e.g. CMP-2026-1001)..."
            value={searchTicket}
            onChange={(e) => setSearchTicket(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
          />
        </form>

        {/* Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* WebSocket status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 shadow-glow-emerald animate-pulse' : 'bg-amber-400'}`} />
            {connected ? 'Live Sync' : 'Reconnecting'}
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Switch Role</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl glass-card shadow-2xl border border-white/10 z-50 animate-in fade-in zoom-in-95">
                <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Active Role</p>
                <button
                  onClick={() => { demoLogin('student'); setRoleDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 text-slate-200 hover:bg-white/10 transition"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Student (Aarav)</p>
                    <p className="text-[10px] text-slate-400">Lodge & track grievances</p>
                  </div>
                </button>
                <button
                  onClick={() => { demoLogin('staff.wifi'); setRoleDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 text-slate-200 hover:bg-white/10 transition"
                >
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="font-semibold">Dept Staff (Sneha - IT)</p>
                    <p className="text-[10px] text-slate-400">Resolve & update tasks</p>
                  </div>
                </button>
                <button
                  onClick={() => { demoLogin('admin'); setRoleDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 text-slate-200 hover:bg-white/10 transition"
                >
                  <Shield className="w-4 h-4 text-rose-400" />
                  <div>
                    <p className="font-semibold">Dean Admin (Dr. Sundaram)</p>
                    <p className="text-[10px] text-slate-400">Assign, escalate, analytics</p>
                  </div>
                </button>
                <button
                  onClick={() => { demoLogin('principal'); setRoleDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 text-slate-200 hover:bg-white/10 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-semibold">Principal (Super Admin)</p>
                    <p className="text-[10px] text-slate-400">Full executive authority</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center rounded-full border-2 border-slate-950 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                className="w-8 h-8 rounded-xl object-cover border border-white/10"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-glow"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
