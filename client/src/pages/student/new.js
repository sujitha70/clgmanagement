import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { AIAssistantWidget } from '../../components/ai/AIAssistantWidget';
import {
  PlusCircle,
  Building,
  MapPin,
  Flame,
  FileText,
  Upload,
  EyeOff,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEPARTMENTS = [
  { id: 'auto', name: '✨ AI Auto-Detect Department' },
  { id: 'wifi_it', name: 'IT & Wi-Fi Network' },
  { id: 'hostel', name: 'Hostel & Residential' },
  { id: 'mess', name: 'Mess & Food Quality' },
  { id: 'academics', name: 'Academics & Faculty' },
  { id: 'infrastructure', name: 'Infrastructure & Maintenance' },
  { id: 'library', name: 'Library Services' },
  { id: 'accounts', name: 'Accounts & Fee Section' },
  { id: 'transport', name: 'Campus Transportation' },
  { id: 'sanitation', name: 'Sanitation & Cleanliness' },
  { id: 'sports', name: 'Sports & Amenities' }
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function NewComplaintPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { showToast } = useNotifications();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('auto');
  const [location, setLocation] = useState(user?.hostelBlock ? `${user.hostelBlock}, ${user.roomNumber || ''}` : '');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  // AI Triage states
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading]);

  // Debounced AI Triage analysis on text change
  useEffect(() => {
    if (!title && !description) {
      setAiAnalysis(null);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (title.length > 5 || description.length > 10) {
        setAiLoading(true);
        try {
          const res = await fetch(`${API_BASE}/api/complaints/ai-triage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, location })
          });
          const data = await res.json();
          if (data.success && data.analysis) {
            setAiAnalysis(data.analysis);
            // If department was set to auto, adopt the AI suggestion
            if (department === 'auto' && data.analysis.suggestedCategory) {
              // keep as auto or suggest
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setAiLoading(false);
        }
      }
    }, 600);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title, description, location]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected].slice(0, 5));

    const previews = selected.map(file => ({
      name: file.originalname || file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setFilePreviews(prev => [...prev, ...previews].slice(0, 5));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyCategory = (cat) => {
    setDepartment(cat);
    showToast({ title: 'Department Applied', message: `Selected ${cat.replace('_', ' ')}`, type: 'info' });
  };

  const handleApplyPriority = (prio) => {
    setPriority(prio);
    showToast({ title: 'Priority Set', message: `Set to ${prio}`, type: 'info' });
  };

  const handleViewDuplicate = (ticketId) => {
    router.push(`/student/${ticketId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please fill in both the title and detailed description.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('department', department === 'auto' ? (aiAnalysis?.suggestedCategory || 'infrastructure') : department);
      formData.append('location', location || 'Main Campus');
      formData.append('priority', priority);
      formData.append('description', description);
      formData.append('isAnonymous', isAnonymous);

      files.forEach(file => {
        formData.append('attachments', file);
      });

      const res = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to lodge complaint.');
      }

      showToast({
        title: 'Grievance Registered 🎉',
        message: `Ticket ${data.complaint.ticketId} lodged successfully.`,
        type: 'success'
      });

      router.push(`/student/${data.complaint.ticketId}`);
    } catch (err) {
      setError(err.message || 'Failed to submit grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-500/30">
          Smart Grievance Form
        </span>
      </div>

      <div className="text-left space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Lodge a New Campus Grievance</h1>
        <p className="text-xs text-slate-400">
          Describe the problem clearly. Our AI triage system will automatically determine the department, assign urgency, and check for duplicates.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Submission Layout with AI Assistant Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 glass-card rounded-3xl border border-white/10 p-6 shadow-xl">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Complaint Title / Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wi-Fi router drops connection in Kaveri Hostel 3rd Floor..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm rounded-xl glass-input placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Department & Priority in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                Target Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl glass-input bg-slate-900 focus:outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl glass-input bg-slate-900 focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {p} Priority {p === 'Critical' ? '(12h SLA)' : p === 'High' ? '(24h SLA)' : '(72h SLA)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Specific Location / Block / Room
            </label>
            <input
              type="text"
              placeholder="e.g. Kaveri Hostel Block B, Room 304 or Central Library 2nd floor"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Detailed Description & Evidence *
            </label>
            <textarea
              rows={5}
              required
              placeholder="Explain the problem in detail: when did it start, frequency of occurrence, impacts on study/living, any steps already taken..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm rounded-xl glass-input placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Attachments / Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              Attach Photos / Error Screenshots (Max 5 files)
            </label>
            <div className="border border-dashed border-white/20 rounded-2xl p-4 text-center hover:border-blue-500/50 transition bg-slate-900/40">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-1 block">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-blue-400 hover:underline">Click to upload photos or documents</p>
                <p className="text-[10px] text-slate-500">PNG, JPG, WEBP, PDF up to 10MB each</p>
              </label>
            </div>

            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {filePreviews.map((f, idx) => (
                  <div key={idx} className="relative group p-1.5 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2 text-xs">
                    {f.type.startsWith('image/') ? (
                      <img src={f.url} alt="preview" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <FileText className="w-6 h-6 text-blue-400" />
                    )}
                    <span className="truncate max-w-[120px] text-[11px] text-slate-300">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Checkbox */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-white">Lodge Anonymously</p>
                <p className="text-[10px] text-slate-400">Your name and roll number will be hidden from staff</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-white/20 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Lodge in Progress...' : 'Submit Grievance & Receive Ticket'}</span>
          </button>
        </form>

        {/* AI Assistant Sidebar (1 col) */}
        <div className="space-y-4">
          <AIAssistantWidget
            analysis={aiAnalysis}
            loading={aiLoading}
            onApplyCategory={handleApplyCategory}
            onApplyPriority={handleApplyPriority}
            onViewDuplicate={handleViewDuplicate}
          />

          <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Campus SLA Guarantees</h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>🔴 Critical (Safety Hazard):</span>
                <strong className="text-white">12 Hours</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>🟠 High (Exam/Payment):</span>
                <strong className="text-white">24 Hours</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>🟡 Medium (General Fixes):</span>
                <strong className="text-white">72 Hours</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>🟢 Low (Requisitions):</span>
                <strong className="text-white">120 Hours</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
