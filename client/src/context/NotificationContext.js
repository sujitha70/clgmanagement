import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Play audio chime
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // AudioContext not supported or permission denied
    }
  };

  const showToast = (toast) => {
    const id = Date.now().toString();
    const newToast = { id, ...toast };
    setToasts(prev => [newToast, ...prev].slice(0, 4));
    playAlertSound();

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?._id, token]);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewComplaint = (data) => {
      if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'staff') {
        showToast({
          title: data.notification?.title || 'New Complaint Received',
          message: data.notification?.message || data.complaint?.title,
          type: 'info'
        });
        fetchNotifications();
      }
    };

    const handleEscalation = (data) => {
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        showToast({
          title: `🚨 SLA Escalation: ${data.ticketId}`,
          message: `${data.title} is overdue for resolution.`,
          type: 'danger'
        });
        fetchNotifications();
      }
    };

    const handleStatusChanged = (data) => {
      showToast({
        title: `Status: ${data.ticketId}`,
        message: `Updated to ${data.status} by ${data.updatedBy}`,
        type: 'success'
      });
      fetchNotifications();
    };

    socket.on('new_complaint', handleNewComplaint);
    socket.on('escalation_alert', handleEscalation);
    socket.on('complaint_status_changed', handleStatusChanged);

    return () => {
      socket.off('new_complaint', handleNewComplaint);
      socket.off('escalation_alert', handleEscalation);
      socket.off('complaint_status_changed', handleStatusChanged);
    };
  }, [socket, user?.role]);

  const markAsRead = async (notifId) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isDrawerOpen,
        setIsDrawerOpen,
        toasts,
        showToast,
        removeToast,
        markAsRead,
        markAllRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
