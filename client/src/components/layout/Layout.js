import React from 'react';
import { useRouter } from 'next/router';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { NotificationDrawer } from './NotificationDrawer';
import { ToastContainer } from '../common/ToastContainer';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ShieldAlert,
  BarChart3,
  User
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, isAdmin, isStaff, isStudent } = useAuth();
  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {user && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-white/10 backdrop-blur-xl px-2 py-2 flex items-center justify-around">
          {isAdmin ? (
            <>
              <button
                onClick={() => router.push('/admin')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
                  isActive('/admin') ? 'text-blue-400' : 'text-slate-400'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => router.push('/admin/complaints')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
                  isActive('/admin/complaints') ? 'text-blue-400' : 'text-slate-400'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Complaints</span>
              </button>
              <button
                onClick={() => router.push('/admin/escalation')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
                  isActive('/admin/escalation') ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Escalations</span>
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
                  isActive('/admin/analytics') ? 'text-blue-400' : 'text-slate-400'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </button>
            </>
          ) : isStaff ? (
            <>
              <button
                onClick={() => router.push('/staff')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
                  isActive('/staff') ? 'text-blue-400' : 'text-slate-400'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Queue</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/student')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
                  isActive('/student') ? 'text-blue-400' : 'text-slate-400'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Home</span>
              </button>
              <button
                onClick={() => router.push('/student/new')}
                className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold text-white bg-blue-600 shadow-glow"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Lodge</span>
              </button>
              <button
                onClick={() => router.push('/student')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
                  isActive('/student') ? 'text-blue-400' : 'text-slate-400'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>My Tickets</span>
              </button>
            </>
          )}
        </div>
      )}

      <NotificationDrawer />
      <ToastContainer />
    </div>
  );
};
