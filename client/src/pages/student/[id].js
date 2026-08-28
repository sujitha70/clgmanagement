import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { TimelineView } from '../../components/complaints/TimelineView';
import { FeedbackModal } from '../../components/complaints/FeedbackModal';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  Star,
  MessageSquare,
  Send,
  Lock,
  Paperclip,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Clock,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ComplaintDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token, isAdmin, isStaff, isStudent } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useNotifications();

  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const fetchComplaint = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/complaints/${id}`, { headers });
      const data = await res.json();
      if (data.success && data.complaint) {
        setComplaint(data.complaint);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (!token || (!isAdmin && !isStaff)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaint();
    fetchStaff();
  }, [id, token]);

  // Join WebSocket ticket room
  useEffect(() => {
    if (!socket || !complaint?.ticketId) return;

    socket.emit('join_complaint', complaint.ticketId);

    const handleUpdate = (data) => {
      if (data.complaint) {
        setComplaint(data.complaint);
      }
    };

    socket.on(`complaint_updated_${complaint.ticketId}`, handleUpdate);

    return () => {
      socket.off(`complaint_updated_${complaint.ticketId}`, handleUpdate);
    };
  }, [socket, complaint?.ticketId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !token) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_BASE}/api/complaints/${complaint._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: commentText,
          isInternal: isInternalNote
        })
      });
      const data = await res.json();
      if (data.success && data.complaint) {
        setComplaint(data.complaint);
        setCommentText('');
        showToast({ title: 'Comment Posted', message: 'Your update has been recorded.', type: 'info' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (statusData) => {
    const res = await fetch(`${API_BASE}/api/complaints/${complaint._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });
    const data = await res.json();
    if (data.success && data.complaint) {
      setComplaint(data.complaint);
      showToast({ title: 'Status Updated', message: `Ticket updated to ${statusData.status}`, type: 'success' });
    }
  };

  const handleAssignStaff = async (assignData) => {
    const res = await fetch(`${API_BASE}/api/complaints/${complaint._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(assignData)
    });
    const data = await res.json();
    if (data.success && data.complaint) {
      setComplaint(data.complaint);
      showToast({ title: 'Staff Assigned', message: 'Task assigned successfully.', type: 'info' });
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    const res = await fetch(`${API_BASE}/api/complaints/${complaint._id}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(feedbackData)
    });
    const data = await res.json();
    if (data.success && data.complaint) {
      setComplaint(data.complaint);
      showToast({ title: 'Thank You! 🌟', message: 'Your rating has been saved and ticket closed.', type: 'success' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-800 rounded-3xl" />
        <div className="h-48 bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Grievance Ticket Not Found</h2>
        <p className="text-xs text-slate-400">
          The ticket identifier <span className="font-mono text-white">{id}</span> does not exist or may have been removed.
        </p>
        <button
          onClick={() => router.push(user ? (isAdmin ? '/admin' : '/student') : '/')}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-glow"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isOwnerStudent = user && complaint.studentId === user._id;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        {/* Action Controls for Staff / Admin */}
        <div className="flex items-center gap-2">
          {(isAdmin || isStaff) && (
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition shadow-glow flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Update Status / Assign</span>
            </button>
          )}

          {/* Student Feedback Button if Resolved */}
          {complaint.status === 'Resolved' && (isOwnerStudent || isStudent) && (
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 transition shadow-glow flex items-center gap-1.5 animate-bounce"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Rate Resolution & Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Ticket Banner */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-blue-400 bg-blue-950/80 px-3 py-1 rounded-xl border border-blue-500/40">
              {complaint.ticketId}
            </span>
            <StatusBadge status={complaint.status} size="lg" />
            <PriorityBadge priority={complaint.priority} size="lg" isEscalated={complaint.isEscalated} />
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Lodged {new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
          {complaint.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-2xl border border-white/5">
          {complaint.description}
        </p>

        {/* Metadata Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</p>
            <p className="font-semibold text-white mt-0.5 capitalize">{complaint.department ? complaint.department.replace('_', ' ') : 'General'}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location / Room</p>
            <p className="font-semibold text-white mt-0.5 truncate">{complaint.location || 'Campus'}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lodged By</p>
            <p className="font-semibold text-white mt-0.5">
              {complaint.isAnonymous ? 'Anonymous Student' : `${complaint.studentName} (${complaint.studentRollNumber || 'Student'})`}
            </p>
          </div>
        </div>

        {/* Attachments Section */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              Attached Proof Files ({complaint.attachments.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {complaint.attachments.map((att, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-3">
                  {att.url?.startsWith('http') || att.url?.startsWith('/uploads') ? (
                    <img
                      src={att.url.startsWith('/') ? `${API_BASE}${att.url}` : att.url}
                      alt={att.filename}
                      className="w-14 h-14 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      DOC
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-white truncate max-w-[150px]">{att.filename}</p>
                    <a
                      href={att.url.startsWith('/') ? `${API_BASE}${att.url}` : att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>View File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Details Card if Resolved/Closed */}
        {complaint.resolutionDetails && complaint.resolutionDetails.resolutionNotes && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Official Resolution Summary</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-mono">
                {new Date(complaint.resolutionDetails.resolvedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {complaint.resolutionDetails.resolutionNotes}
            </p>
            <p className="text-[11px] text-slate-400">
              Resolved by: <strong className="text-white">{complaint.resolutionDetails.resolvedBy || 'Department Staff'}</strong>
            </p>
          </div>
        )}

        {/* Student Feedback & Rating Display */}
        {complaint.feedback && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>Student Resolution Feedback</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= complaint.feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-white ml-1">{complaint.feedback.rating}/5</span>
              </div>
            </div>
            {complaint.feedback.comment && (
              <p className="text-xs text-slate-200 italic">"{complaint.feedback.comment}"</p>
            )}
          </div>
        )}
      </div>

      {/* Lifecycle Timeline Component */}
      <TimelineView status={complaint.status} timeline={complaint.timeline || []} />

      {/* Discussion & Updates Thread */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Live Updates & Discussion</h3>
          </div>
          <span className="text-xs text-slate-400">
            {complaint.comments?.length || 0} message(s)
          </span>
        </div>

        {/* Comments Stream */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {(!complaint.comments || complaint.comments.length === 0) ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No comments or staff notes yet. Use the box below to ask questions or post updates.
            </p>
          ) : (
            complaint.comments.map((comment, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs ${
                  comment.isInternal
                    ? 'bg-purple-950/30 border-purple-500/30 text-purple-100'
                    : comment.authorRole === 'student'
                    ? 'bg-slate-900/80 border-white/5 text-slate-200 ml-4'
                    : 'bg-indigo-950/40 border-indigo-500/20 text-indigo-100 mr-4'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{comment.authorName}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {comment.authorRole}
                    </span>
                    {comment.isInternal && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-900/60 px-1.5 py-0.2 rounded border border-purple-500/30">
                        <Lock className="w-2.5 h-2.5" />
                        Internal Staff Note
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="leading-relaxed mt-1 whitespace-pre-line">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input Box */}
        {user ? (
          <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-white/5">
            <div className="relative">
              <textarea
                rows={2}
                required
                placeholder={isInternalNote ? "Write private administrative note..." : "Add a public update or message..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={`w-full p-3 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none ${
                  isInternalNote ? 'border-purple-500/40 bg-purple-950/20' : ''
                }`}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              {(isAdmin || isStaff) ? (
                <label className="flex items-center gap-1.5 text-xs text-purple-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-purple-600 bg-slate-900 border-white/20 cursor-pointer"
                  />
                  <span>Mark as Internal Staff Note (hidden from student)</span>
                </label>
              ) : <div />}

              <button
                type="submit"
                disabled={submittingComment}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-glow transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingComment ? 'Posting...' : 'Post Message'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 text-center rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400">
            <button onClick={() => router.push('/login')} className="text-blue-400 font-bold hover:underline">
              Sign in
            </button> to post comments or resolution updates on this ticket.
          </div>
        )}
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
        ticketId={complaint.ticketId}
      />

      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onAssignStaff={handleAssignStaff}
        complaint={complaint}
        staffList={staffList}
      />
    </div>
  );
}
