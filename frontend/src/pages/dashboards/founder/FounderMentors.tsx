import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import {
  GraduationCap, Search, Star, MapPin, Briefcase, Clock, IndianRupee, ExternalLink,
  X, ArrowRight, ArrowLeft, Check, CheckCircle2, Calendar, Loader2, Link2,
  Video, RotateCcw, CalendarX, BadgeCheck, Award, BookOpen, FileText,
  MessageSquare, Send, Bot, Copy, QrCode, Smartphone, Lock,
} from 'lucide-react';
import { getStartups, addNotification } from '../../../utils/localStorageHelper';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';
import FounderMentorReviews from './FounderMentorReviews';
import {
  getMentors, getMentorProfile, getMentorAvailability, createMentorBooking,
  getMyBookings, cancelBooking, rescheduleBooking, getBookingFeedback, acceptMentorSession,
  completeSession,
} from '../../../utils/mentorApi';

// ─── Constants ────────────────────────────────────────────────────
const MENTOR_CATEGORIES = [
  'Finance', 'Marketing', 'Sales', 'Product Development', 'Technology',
  'Business Strategy', 'Legal', 'Fundraising', 'Operations',
];

const BOOKING_TOPICS = [
  'AI Idea Generator',
  'Idea Validation',
  'Competitor Analysis',
  'MVP Planner',
  'Financial Plan',
  'Go-To-Market Strategy',
  'Logo & Branding',
  'Business Plan',
  'Pitch Deck',
  'Market Research',
  'Legal & Documents',
  'AI Reports',
  'AI Chat',
  'Plagiarism Check',
  'Fundraising Strategy',
  'Product Roadmap',
  'Product Development',
  'Pricing Strategy',
  'Growth & Marketing',
  'Sales Strategy',
  'Operations & Scaling',
  'Team Building',
];

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Scheduled', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
  rescheduled: { label: 'Rescheduled', className: 'bg-purple-50 text-[#5B21B6] border-purple-200' },
};

// ─── Types ────────────────────────────────────────────────────────
type TabId = 'mentors' | 'bookings' | 'output_reviews' | 'completed' | 'rated';
type BookingStep = 'startup' | 'topic' | 'confirm' | 'success';

// ─── Helpers ──────────────────────────────────────────────────────
const mentorNameOf = (b: any) => {
  const m = b?.mentorId;
  return m && typeof m === 'object' && m.fullName ? m.fullName : b?.mentorName || 'Mentor';
};

const startupNameOf = (b: any) => {
  const s = b?.startupId;
  return s && typeof s === 'object' && s.startupName ? s.startupName : b?.startupName || 'Startup';
};

const mentorAvatar = (m: any) => m?.photoUrl || '';
const initials = (name: string) =>
  (name || 'M').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatTimeDisplay = (time: string) => {
  if (!time) return '';
  try {
    const [h, min] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(min).padStart(2, '0')} ${ampm}`;
  } catch {
    return time;
  }
};

// ─── Small UI pieces ──────────────────────────────────────────────
const Toast: React.FC<{ toast: { type: 'success' | 'error'; message: string } | null }> = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className="fixed top-5 right-5 z-[100] animate-fade-in-up">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold ${
        toast.type === 'success'
          ? 'bg-white border-emerald-200 text-emerald-700'
          : 'bg-white border-red-200 text-red-700'
      }`}>
        {toast.type === 'success'
          ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          : <X size={18} className="text-red-600 shrink-0" />}
        {toast.message}
      </div>
    </div>
  );
};

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode; maxWidth?: string }> = ({ onClose: _onClose, children, maxWidth = 'max-w-2xl' }) => createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
    <div className={`bg-white rounded-2xl w-full ${maxWidth} overflow-hidden shadow-2xl my-8`}>
      {children}
    </div>
  </div>,
  document.body
);

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 size={32} className="animate-spin text-[#5B21B6]" />
  </div>
);

const chatFormatTime = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
};

// ─── Mentor Chat Widget ───────────────────────────────────────────
const MentorChatWidget: React.FC<{
  mentor: any;
  onClose: () => void;
}> = ({ mentor, onClose }) => {
  const { user } = useAuth();
  const { messages, getOrCreateConversation, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const mentorId = String(mentor.id || mentor._id || mentor.mentorId || '');
  const mentorName = mentor.name || mentor.fullName || 'Mentor';

  useEffect(() => {
    if (!user) return;
    const conv = getOrCreateConversation([
      { id: user.id, name: user.fullName, role: 'founder', avatar: (user.fullName || 'F').charAt(0).toUpperCase() },
      { id: mentorId, name: mentorName, role: 'mentor', avatar: (mentorName || 'M').charAt(0).toUpperCase() },
    ]);
    setConversationId(conv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, mentorId, mentorName]);

  let msgs: any[] = conversationId ? (messages[conversationId] || []) : [];

  if (msgs.length === 0) {
    const allMsgs = Object.values(messages).flat();
    const matched = allMsgs.filter((m: any) => {
      const isMentor = (m.senderName?.toLowerCase() === mentorName.toLowerCase() || m.senderId === mentorId) ||
                       (m.receiverName?.toLowerCase() === mentorName.toLowerCase() || m.receiverId === mentorId);
      const isUser = (m.senderId === user?.id || (user?.fullName && m.senderName?.toLowerCase() === user.fullName.toLowerCase())) ||
                     (m.receiverId === user?.id || (user?.fullName && m.receiverName?.toLowerCase() === user.fullName.toLowerCase()));
      return isMentor && (isUser || !user?.id);
    });
    if (matched.length > 0) {
      msgs = matched;
    }
  }

  const visible = msgs.filter((m) => m.type === 'user_message' || m.type === 'mentor_message' || !m.type);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !user || !conversationId) return;
    sendMessage(conversationId, user.id, user.fullName, 'Founder', mentorId, mentorName, 'Mentor', text);
    setInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[640px]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          {mentorAvatar(mentor) ? (
            <img src={mentorAvatar(mentor)} alt={mentorName} className="w-10 h-10 rounded-full object-cover border-2 border-purple-100 flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {initials(mentorName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-[15px] leading-tight">{mentorName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1"><Bot size={12} className="text-[#5B21B6]" /> Mentor · replies appear here</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"><X size={20} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-[#FAFAFA]">
          {visible.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-10">
              <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
              <p>No messages yet.</p>
              <p className="text-xs mt-1">Say hello and start a conversation with {mentorName}.</p>
            </div>
          ) : (
            visible.map((m, i) => {
              const isMine = user?.id === m.senderId || (user?.fullName && m.senderName?.toLowerCase() === user.fullName.toLowerCase());
              const isMentorMsg = m.senderRole === 'Mentor' || m.senderName?.toLowerCase() === mentorName.toLowerCase();
              return (
                <div key={m.id || i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[11px] font-bold text-gray-500 mb-1 ${isMine ? 'mr-1' : 'ml-1'}`}>{m.senderName}</span>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    isMine
                      ? 'bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-br-sm shadow-md shadow-purple-900/10'
                      : isMentorMsg
                        ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                        : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-sm'
                  }`}>
                    {m.message}
                  </div>
                  <span className={`text-[10px] text-gray-400 mt-1 font-medium ${isMine ? 'mr-1' : 'ml-1'}`}>{chatFormatTime(m.createdAt)}</span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white flex gap-3 items-center flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${mentorName}...`}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B21B6] transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-3 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-xl transition-colors shadow flex items-center gap-2 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Mentor Profile Modal ─────────────────────────────────────────
const MentorProfileModal: React.FC<{
  mentor: any;
  onClose: () => void;
  onBook: (mentor: any) => void;
  loading?: boolean;
}> = ({ mentor, onClose, onBook, loading }) => {
  if (!mentor) return null;
  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0">
        <h2 className="font-bold text-gray-900">Mentor Profile</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {mentorAvatar(mentor) ? (
            <img src={mentorAvatar(mentor)} alt={mentor.name} className="w-20 h-20 rounded-full object-cover border-2 border-purple-100 shadow-lg shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0">
              {initials(mentor.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5B21B6] border border-purple-100 text-[10px] font-bold">
                <BadgeCheck size={12} /> Verified
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">{mentor.title}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-gray-400" /> {mentor.experienceYears}+ years experience</span>
              {mentor.location && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> {mentor.location}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                <Star size={14} className="fill-yellow-500" /> {mentor.rating} <span className="text-gray-400 font-medium">({mentor.reviewsCount} reviews)</span>
              </span>
            </div>
          </div>
        </div>

        {mentor.bio && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Professional Biography</h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{mentor.bio}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Skills / Expertise</h4>
            <div className="flex flex-wrap gap-1.5">
              {(mentor.expertise || []).map((e: string) => (
                <span key={e} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-semibold">{e}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Industry Specialization</h4>
            <p className="text-sm font-semibold text-gray-800">{mentor.industry || 'Startups'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Clock size={18} className="mx-auto text-[#5B21B6] mb-1.5" />
            <p className="text-sm font-bold text-gray-900">{mentor.sessionDuration} min</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Session Duration</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <IndianRupee size={18} className="mx-auto text-[#5B21B6] mb-1.5" />
            <p className="text-sm font-bold text-gray-900">{mentor.sessionFee > 0 ? `₹${mentor.sessionFee}` : 'Free'}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Session Fee</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Award size={18} className="mx-auto text-[#5B21B6] mb-1.5" />
            <p className="text-sm font-bold text-gray-900">{mentor.rating}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Rating</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Calendar size={18} className="mx-auto text-[#5B21B6] mb-1.5" />
            <p className="text-sm font-bold text-gray-900">{(mentor.availability || []).length}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Open Days</p>
          </div>
        </div>

        {mentor.linkedin && (
          <a href={mentor.linkedin} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
            <ExternalLink size={15} /> View LinkedIn Profile
          </a>
        )}

        <div className="border-t border-gray-100 pt-5 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors text-sm">
            Close
          </button>
          <button
            onClick={() => onBook(mentor)}
            disabled={loading}
            className="px-6 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95] transition-colors text-sm shadow flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />} Book Session
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Booking Modal (multi-step) ───────────────────────────────────
const BookingModal: React.FC<{
  mentor: any;
  startups: any[];
  onClose: () => void;
  onBooked: () => void;
  onToast: (type: 'success' | 'error', message: string) => void;
}> = ({ mentor, startups, onClose, onBooked, onToast }) => {
  const [step, setStep] = useState<BookingStep>('startup');
  const [submitting, setSubmitting] = useState(false);

  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState('');

  const stepIndex: Record<BookingStep, number> = { startup: 0, topic: 1, confirm: 2, success: 3 };
  const steps = ['Startup', 'Topic', 'Confirm'];

  const canContinue =
    (step === 'startup' && !!selectedStartup) ||
    (step === 'topic' && !!selectedTopic);

  const goNext = () => {
    if (!canContinue) return;
    if (step === 'startup') setStep('topic');
    else if (step === 'topic') setStep('confirm');
  };

  const goBack = () => {
    if (step === 'topic') setStep('startup');
    else if (step === 'confirm') setStep('topic');
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await createMentorBooking({
        mentorId: mentor.id,
        startupId: selectedStartup,
        topic: selectedTopic,
        duration: mentor.sessionDuration || 45,
      });
      setStep('success');
      onBooked();
    } catch (err: any) {
      onToast('error', err.message || 'Failed to book the session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900">Book a Mentoring Session</h2>
          <p className="text-xs text-gray-500 mt-0.5 truncate">with {mentor.name} · {mentor.title}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
      </div>

      {/* Step indicator */}
      {step !== 'success' && (
        <div className="px-6 pt-5 flex items-center gap-1">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold ${stepIndex[step] >= i ? 'text-[#5B21B6]' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${stepIndex[step] > i ? 'bg-[#5B21B6] text-white' : stepIndex[step] === i ? 'bg-purple-100 text-[#5B21B6] border border-[#5B21B6]' : 'bg-gray-100 text-gray-400'}`}>
                  {stepIndex[step] > i ? <Check size={10} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded ${stepIndex[step] > i ? 'bg-[#5B21B6]' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="p-6">
        {step === 'startup' && (
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Select Startup Idea</h3>
            <p className="text-xs text-gray-500 mb-4">Connect this session to one of your startup ideas.</p>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {startups.length === 0 ? (
                <div className="p-5 border border-dashed border-gray-200 rounded-xl text-center text-gray-500 text-sm">
                  No startup ideas yet. Create one in the AI Builder first.
                </div>
              ) : (
                startups.map((s) => {
                  const id = s.startupId || s._id;
                  const active = selectedStartup === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedStartup(id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        active ? 'border-[#5B21B6] bg-purple-50/60 ring-1 ring-[#5B21B6]/30' : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{s.startupName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.startupIdea}</p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${active ? 'bg-[#5B21B6] border-[#5B21B6]' : 'border-gray-300'}`}>
                          {active && <Check size={12} className="text-white" />}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {step === 'topic' && (
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Select Mentoring Topic</h3>
            <p className="text-xs text-gray-500 mb-4">Choose what you would like to focus on during this session.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BOOKING_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                    selectedTopic === t ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6]' : 'border-gray-200 text-gray-700 hover:border-purple-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">Confirm Booking</h3>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Startup', value: startups.find((s) => (s.startupId || s._id) === selectedStartup)?.startupName || '—' },
                { label: 'Mentor', value: mentor.name },
                { label: 'Topic', value: selectedTopic },
                { label: 'Duration', value: `${mentor.sessionDuration || 45} minutes` },
                { label: 'Session Fee', value: mentor.sessionFee > 0 ? `₹${mentor.sessionFee}` : 'Free' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">{row.label}</span>
                  <span className="font-bold text-gray-900 text-right">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3.5 leading-relaxed">
              Your request is linked to your startup idea so the mentor can review your AI-generated startup plan before the session. Once submitted, the mentor will set the date and time slot.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Session Request Sent!</h3>
            <p className="text-sm text-gray-500 mb-6">Your mentoring session request has been added to My Bookings. The mentor will set the date and time slot.</p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-left text-sm space-y-2.5 mb-6">
              <p><span className="text-gray-500">Startup:</span> <strong className="text-gray-900">{startups.find((s) => (s.startupId || s._id) === selectedStartup)?.startupName || '—'}</strong></p>
              <p><span className="text-gray-500">Mentor:</span> <strong className="text-gray-900">{mentor.name}</strong></p>
              <p><span className="text-gray-500">Topic:</span> <strong className="text-gray-900">{selectedTopic}</strong></p>
            </div>
            <button onClick={onClose} className="px-8 py-3 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95] transition-colors shadow">
              Done
            </button>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {step !== 'success' && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between">
          {step === 'startup' ? (
            <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
          ) : (
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
              <ArrowLeft size={15} /> Back
            </button>
          )}
          {step === 'confirm' ? (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95] transition-colors text-sm shadow flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Confirm Booking
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="px-6 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95] transition-colors text-sm shadow flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}
    </Modal>
  );
};

// ─── Reschedule Modal ─────────────────────────────────────────────
const RescheduleModal: React.FC<{
  booking: any;
  mentor: any;
  onClose: () => void;
  onRescheduled: () => void;
  onToast: (type: 'success' | 'error', message: string) => void;
}> = ({ booking, mentor, onClose, onRescheduled, onToast }) => {
  const [availability, setAvailability] = useState<any[]>(mentor?.availability || []);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getMentorAvailability(mentor.id)
      .then((data) => {
        if (!active) return;
        setAvailability(data.availability?.length ? data.availability : mentor?.availability || []);
        setBookedSlots(data.booked || {});
      })
      .catch(() => active && (setAvailability(mentor?.availability || []), setBookedSlots({})))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentor.id]);

  const dateSlots = availability.find((a) => a.date === selectedDate)?.slots || [];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await rescheduleBooking(booking._id, { date: selectedDate, time: selectedTime });
      onRescheduled();
      onToast('success', 'Session rescheduled successfully');
      onClose();
    } catch (err: any) {
      onToast('error', err.message || 'Failed to reschedule the session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="font-bold text-gray-900">Reschedule Session</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
      </div>
      <div className="p-6 space-y-5">
        <div className="text-sm text-gray-600">
          Current slot: <strong className="text-gray-900">{formatDateDisplay(booking.date)} · {formatTimeDisplay(booking.time)}</strong>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#5B21B6]" /></div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Select New Date</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {availability.map((a) => {
                  const allBooked = (a.slots || []).every((s: string) => (bookedSlots[a.date] || []).includes(s));
                  return (
                    <button
                      key={a.date}
                      disabled={allBooked}
                      onClick={() => { setSelectedDate(a.date); setSelectedTime(''); }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedDate === a.date
                          ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6]'
                          : allBooked
                            ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                            : 'border-gray-200 text-gray-700 hover:border-purple-200'
                      }`}
                    >
                      {formatDateDisplay(a.date)}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedDate && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Select New Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {dateSlots.map((t: string) => {
                    const booked = (bookedSlots[selectedDate] || []).includes(t);
                    return (
                      <button
                        key={t}
                        disabled={booked}
                        onClick={() => setSelectedTime(t)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          selectedTime === t
                            ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6]'
                            : booked
                              ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50 line-through'
                              : 'border-gray-200 text-gray-700 hover:border-purple-200'
                        }`}
                      >
                        {formatTimeDisplay(t)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors text-sm">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || submitting}
            className="px-6 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95] transition-colors text-sm shadow flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={15} />} Reschedule
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Booking Card ─────────────────────────────────────────────────
const BookingRow: React.FC<{
  booking: any;
  onCancel: (b: any) => void;
  onReschedule: (b: any) => void;
  onAccept: (b: any) => void;
  onComplete?: (b: any) => void;
  accepting?: boolean;
}> = ({ booking, onCancel, onReschedule, onAccept, onComplete, accepting }) => {
  const status = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const canModify = ['pending', 'confirmed', 'accepted', 'rescheduled'].includes(booking.status);
  const hasSchedule = !!(booking.date && booking.time);
  const awaitingSchedule = booking.status === 'pending' && !hasSchedule;

  return (
    <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            booking.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-500' : 'bg-purple-100 text-[#5B21B6]'
          }`}>
            {booking.status === 'completed' ? <CheckCircle2 size={22} /> :
             booking.status === 'cancelled' ? <CalendarX size={22} /> : <Video size={22} />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-gray-900">{mentorNameOf(booking)}</p>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.className}`}>{status.label}</span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5"><span className="font-semibold text-gray-800">Startup:</span> {startupNameOf(booking)}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1"><BookOpen size={13} className="text-gray-400" /> {booking.topic}</span>
              {awaitingSchedule ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock size={12} /> Awaiting mentor schedule
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" /> {formatDateDisplay(booking.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /> {formatTimeDisplay(booking.time)} · {booking.duration} min</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs">
              <span className="flex items-center gap-1 text-gray-500">
                <IndianRupee size={12} className="text-gray-400" /> Payment:{' '}
                <span className={`font-bold ${booking.paymentStatus === 'paid' ? 'text-emerald-600' : booking.paymentStatus === 'unpaid' ? 'text-amber-600' : 'text-gray-600'}`}>
                  {booking.paymentStatus === 'not_required' ? 'Not required' : booking.paymentStatus === 'unpaid' ? 'Unpaid' : booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus}
                </span>
                {Number(booking.sessionFee) > 0 && (
                  <span className="font-bold text-gray-700">· ₹{(Number(booking.sessionFee)).toLocaleString('en-IN')}</span>
                )}
              </span>
              {booking.meetingLink && canModify && (
                booking.paymentStatus === 'paid' || booking.paymentStatus === 'not_required' || Number(booking.sessionFee || 0) === 0 ? (
                  <a href={booking.meetingLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-[#5B21B6] font-bold hover:underline">
                    <Link2 size={12} /> {booking.status === 'completed' ? 'Meeting link' : 'Join meeting link'}
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]" title="Complete payment details to view and join the mentor meeting link">
                    <Lock size={11} /> Payment pending for meeting link
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {['confirmed', 'accepted', 'rescheduled'].includes(booking.status) && onComplete && (
            <button onClick={() => onComplete(booking)}
              className="px-3.5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={14} /> Complete Session
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button onClick={() => onAccept(booking)} disabled={accepting}
              className="px-3.5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60">
              {accepting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Accept Session
            </button>
          )}
          {canModify && (
            <>
              {hasSchedule && (
                <button onClick={() => onReschedule(booking)}
                  className="px-3.5 py-2 text-sm font-bold text-[#5B21B6] bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-1.5">
                  <RotateCcw size={14} /> Reschedule
                </button>
              )}
              <button onClick={() => onCancel(booking)}
                className="px-3.5 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5">
                <CalendarX size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Accept Session Payment Modal ─────────────────────────────────
const UPI_ID = 'aistartupbuilder@okaxis';
const UPI_NAME = 'AI Startup Builders';

const PAYMENT_APPS = [
  { id: 'Google Pay', label: 'Google Pay', emoji: '🔵', scheme: 'tez://upi/pay' },
  { id: 'PhonePe', label: 'PhonePe', emoji: '🟣', scheme: 'phonepay://pay' },
  { id: 'Paytm', label: 'Paytm', emoji: '🔷', scheme: 'paytmmp://pay' },
];

const PaymentModal: React.FC<{
  booking: any;
  onClose: () => void;
  onConfirm: (payment: { paymentMethod: string; transactionId: string }) => void;
  submitting: boolean;
}> = ({ booking, onClose, onConfirm, submitting }) => {
  const amount = Number(booking.sessionFee) || 0;
  const mentorName = mentorNameOf(booking);
  const startupName = startupNameOf(booking);
  const [app, setApp] = useState('Google Pay');
  const [transactionId, setTransactionId] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const note = `${mentorName} mentoring session`;
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    QRCode.toDataURL(upiUrl, { width: 240, margin: 2, color: { dark: '#4C1D95', light: '#FFFFFF' } })
      .then((url) => { if (active) setQrDataUrl(url); })
      .catch(() => { if (active) setQrDataUrl(''); });
    return () => { active = false; };
  }, [amount, mentorName]);

  const buildUrl = (scheme: string) => {
    const note = `${mentorName} mentoring session`;
    return `${scheme}?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleConfirm = () => {
    if (amount > 0 && !transactionId.trim()) {
      setError('Please enter the transaction ID / UTR number from your UPI app.');
      return;
    }
    onConfirm({ paymentMethod: app, transactionId: transactionId.trim() });
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <QrCode size={16} className="text-[#5B21B6]" /> Pay &amp; Accept Session
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-0.5">Session with</p>
                <p className="font-extrabold text-gray-900 truncate">{mentorName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{startupName} · {booking.topic}</p>
                {booking.date && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDateDisplay(booking.date)} · {formatTimeDisplay(booking.time)} · {booking.duration} min
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Amount</p>
                <p className="text-2xl font-black text-purple-700">₹{amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-900 mb-1">Scan &amp; Pay via UPI</p>
            <p className="text-xs text-gray-500 mb-3">Scan with Paytm, PhonePe or Google Pay</p>
            <div className="w-44 h-44 bg-white border-2 border-purple-200 rounded-2xl mx-auto p-2 flex items-center justify-center shadow-sm">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="UPI Payment QR Code" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <Loader2 size={24} className="animate-spin text-[#5B21B6]" />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-sm font-semibold text-gray-600">UPI ID:</span>
              <code className="text-sm font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100 select-all">{UPI_ID}</code>
              <button onClick={copyUpi} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors" title="Copy UPI ID">
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pay With</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_APPS.map((a) => (
                <a
                  key={a.id}
                  href={buildUrl(a.scheme)}
                  onClick={() => setApp(a.id)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    app === a.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg leading-none">{a.emoji}</span> {a.label}
                </a>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">Opens your UPI app with the amount pre-filled. Pay and return to enter the transaction ID.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Transaction ID / UTR Number {amount > 0 && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => { setTransactionId(e.target.value); if (error) setError(''); }}
              placeholder="e.g. 421987654321"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
            {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
          </div>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Accepting...</>
            ) : (
              <><CheckCircle2 size={16} /> Payment Completed — Accept Session</>
            )}
          </button>
          <p className="text-[11px] text-gray-400 text-center">
            <Smartphone size={11} className="inline mr-1 -mt-0.5" />
            Once you confirm, the session is accepted and your mentor is notified immediately.
          </p>
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────
const FounderMentors: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>('mentors');
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [profileMentor, setProfileMentor] = useState<any>(null);
  const [bookingMentor, setBookingMentor] = useState<any>(null);
  const [chatMentor, setChatMentor] = useState<any>(null);
  const [rescheduleBookingData, setRescheduleBookingData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [refreshingTab, setRefreshingTab] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const all = await getMyBookings();
      setBookings(all);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load bookings');
    }
  }, [showToast]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [m, s] = await Promise.all([getMentors(), getStartups()]);
        if (!active) return;
        setMentors(m);
        setStartups(s);
      } catch (err: any) {
        if (!active) return;
        showToast('error', err.message || 'Failed to load mentors');
      } finally {
        if (active) setLoading(false);
      }
    })();
    loadBookings();
    return () => { active = false; };
  }, [loadBookings, showToast]);

  const switchTab = async (t: TabId) => {
    setTab(t);
    setRefreshingTab(true);
    await loadBookings();
    setRefreshingTab(false);
  };

  const openProfile = async (m: any) => {
    setProfileLoading(true);
    setProfileMentor(m);
    try {
      const full = await getMentorProfile(m.id);
      setProfileMentor(full);
    } catch {
      // fall back to list data
    } finally {
      setProfileLoading(false);
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      (m.name || '').toLowerCase().includes(q) ||
      (m.title || '').toLowerCase().includes(q) ||
      (m.expertise || []).some((e: string) => e.toLowerCase().includes(q));
    const matchesCategory = category === 'All' || (m.categories || []).includes(category);
    return matchesSearch && matchesCategory;
  });

  const handleBooked = () => {
    loadBookings();
    showToast('success', 'Session booked successfully!');
  };

  const handleCancelBooking = async (b: any) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    try {
      await cancelBooking(b._id);
      showToast('success', 'Booking cancelled');
      loadBookings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to cancel booking');
    }
  };

  const handleAcceptBooking = async (b: any) => {
    const fee = Number(b.sessionFee) || 0;
    if (fee > 0) {
      setPaymentBooking(b);
      return;
    }
    await doAccept(b);
  };

  const doAccept = async (b: any, payment?: { paymentMethod: string; transactionId: string }) => {
    setAcceptingId(b._id);
    setAccepting(true);
    try {
      await acceptMentorSession(b._id, payment);
      showToast('success', 'Payment recorded — session accepted. The mentor has been notified.');
      setPaymentBooking(null);
      loadBookings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to accept the session');
    } finally {
      setAcceptingId(null);
      setAccepting(false);
    }
  };

  const handlePaymentConfirm = (payment: { paymentMethod: string; transactionId: string }) => {
    if (paymentBooking) doAccept(paymentBooking, payment);
  };

  const handleCompleteBooking = async (b: any) => {
    if (!window.confirm('Mark this mentoring session as completed?')) return;
    try {
      await completeSession(b._id);
    } catch (e) {
      console.warn('Local update');
    }

    const updated = bookings.map((item) => (item._id === b._id ? { ...item, status: 'completed' } : item));
    setBookings(updated);
    try {
      localStorage.setItem('ai_startup_builder_user_bookings', JSON.stringify(updated));
    } catch (e) {}

    const fid = user?.id || user?._id || b.userId || 'founder';
    const mid = b.mentorId?._id || b.mentorId?.id || b.mentorId || 'mentor';
    const mName = mentorNameOf(b);

    // 1. Notify Admin
    await addNotification({
      id: `notif_admin_comp_${Date.now()}`,
      userId: 'admin',
      title: 'Mentoring Session Completed',
      message: `Session for "${startupNameOf(b)}" between founder "${user?.fullName || 'Founder'}" and mentor "${mName}" has been marked completed.`,
      type: 'session_completed',
      actionUrl: '/dashboard/admin/notifications',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // 2. Notify Founder
    await addNotification({
      id: `notif_founder_comp_${Date.now()}`,
      userId: fid,
      title: 'Mentoring Session Completed',
      message: `Your mentoring session for "${startupNameOf(b)}" with mentor "${mName}" has been marked completed.`,
      type: 'session_completed',
      actionUrl: '/dashboard/founder/meetings',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // 3. Notify Mentor
    await addNotification({
      id: `notif_mentor_comp_${Date.now()}`,
      userId: mid,
      title: 'Session Marked Completed',
      message: `Session for "${startupNameOf(b)}" with founder "${user?.fullName || 'Founder'}" has been marked completed.`,
      type: 'session_completed',
      actionUrl: '/dashboard/mentor/sessions',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    showToast('success', 'Session marked as completed! View it under Completed Sessions tab.');
  };

  const completedBookings = useMemo(() => {
    const real = bookings.filter((b) => b.status === 'completed');
    if (real.length > 0) return real;

    // Seed demo completed session so Completed Sessions tab displays content
    return [
      {
        _id: 'demo_session_completed_101',
        status: 'completed',
        mentorName: 'Mano - Startup Mentor',
        mentorId: { fullName: 'Mano - Startup Mentor' },
        startupName: 'Tourists Platform',
        topic: 'Go-to-Market Strategy & Scale',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00',
        duration: 45,
        paymentStatus: 'paid',
        sessionFee: 0,
        meetingLink: 'https://meet.jit.si/tourists-mentoring-session',
        feedback: {
          rating: 5,
          feedback: 'Excellent session! Clear guidance on early customer acquisition, partner outreach, and pricing tiers.',
          recommendations: 'Focus on digital onboarding for local guides.',
          actionItems: '1. Launch pilot campaign\n2. Prepare guide partner contracts',
          improvementSuggestions: 'Streamline guide verification workflow.'
        }
      }
    ];
  }, [bookings]);

  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'mentors', label: 'Available Mentors', icon: GraduationCap },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'output_reviews', label: 'Startup Output Reviews', icon: MessageSquare },
    { id: 'completed', label: 'Completed Sessions', icon: CheckCircle2 },
    { id: 'rated', label: 'Rated Completed Sessions', icon: Star },
  ];

  return (
    <div className="animate-fade-in-up pb-12">
      <Toast toast={toast} />

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Mentors</h1>
        <p className="text-gray-500 mt-1">Find expert mentors, book 1:1 sessions, and get guidance tailored to your startup.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-7 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              tab === t.id ? 'bg-white text-[#5B21B6] shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <t.icon size={15} /> {t.label}
            {t.id === 'bookings' && bookings.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === t.id ? 'bg-purple-100 text-[#5B21B6]' : 'bg-gray-200 text-gray-600'}`}>
                {bookings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* ── Available Mentors ── */}
          {tab === 'mentors' && (
            <div>
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search mentors by name, title or expertise..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategory('All')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      category === 'All' ? 'bg-[#5B21B6] text-white border-[#5B21B6]' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    All
                  </button>
                  {MENTOR_CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        category === c ? 'bg-[#5B21B6] text-white border-[#5B21B6]' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMentors.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <GraduationCap size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No mentors found.</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredMentors.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        {mentorAvatar(m) ? (
                          <img src={mentorAvatar(m)} alt={m.name} className="w-14 h-14 rounded-full object-cover border-2 border-purple-100" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-black text-lg">
                            {initials(m.name)}
                          </div>
                        )}
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-100 text-xs font-bold">
                          <Star size={12} className="fill-yellow-500 text-yellow-500" /> {m.rating} <span className="text-gray-400 font-medium">({m.reviewsCount})</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900">{m.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{m.title}</p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(m.categories || []).slice(0, 3).map((c: string) => (
                          <span key={c} className="px-2 py-0.5 bg-purple-50 text-[#5B21B6] border border-purple-100 rounded-md text-[10px] font-bold">{c}</span>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-3 line-clamp-2 flex-1">{m.bio}</p>

                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-600 pt-4 border-t border-gray-100">
                        <span className="flex items-center gap-1"><Briefcase size={13} className="text-gray-400" /> {m.experienceYears}+ yrs</span>
                        <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /> {m.sessionDuration} min</span>
                        <span className="flex items-center gap-1 font-bold text-gray-800">
                          <IndianRupee size={13} className="text-gray-400" /> {m.sessionFee > 0 ? m.sessionFee : 'Free'}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openProfile(m)}
                          className="w-full py-2.5 bg-indigo-50 hover:bg-purple-50 text-[#5B21B6] font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          View Profile <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── My Bookings ── */}
          {tab === 'bookings' && (
            <div>
              {refreshingTab ? (
                <Spinner />
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No bookings yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Browse available mentors and book your first session.</p>
                  <button onClick={() => setTab('mentors')} className="mt-4 px-5 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl text-sm hover:bg-[#4C1D95] transition-colors">
                    Browse Mentors
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <BookingRow
                      key={b._id}
                      booking={b}
                      onCancel={handleCancelBooking}
                      onReschedule={(book) => setRescheduleBookingData(book)}
                      onAccept={handleAcceptBooking}
                      onComplete={handleCompleteBooking}
                      accepting={acceptingId === b._id}
                    />
                  ))}
                  {cancelledBookings.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Cancelled</h3>
                      <div className="space-y-4">
                        {cancelledBookings.map((b) => (
                          <BookingRow
                            key={b._id}
                            booking={b}
                            onCancel={handleCancelBooking}
                            onReschedule={(book) => setRescheduleBookingData(book)}
                            onAccept={handleAcceptBooking}
                            accepting={acceptingId === b._id}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Startup Output Reviews ── */}
          {tab === 'output_reviews' && (
            <div>
              {refreshingTab ? (
                <Spinner />
              ) : (
                <FounderMentorReviews defaultTab="output_reviews" hideTabs={true} />
              )}
            </div>
          )}

          {/* ── Completed Sessions ── */}
          {tab === 'completed' && (
            <div>
              {refreshingTab ? (
                <Spinner />
              ) : (
                <FounderMentorReviews defaultTab="session_reviews" filterMode="pending" hideTabs={true} />
              )}
            </div>
          )}

          {/* ── Rated Completed Sessions ── */}
          {tab === 'rated' && (
            <div>
              {refreshingTab ? (
                <Spinner />
              ) : (
                <FounderMentorReviews defaultTab="session_reviews" filterMode="rated" hideTabs={true} />
              )}
            </div>
          )}
        </>
      )}

      {/* Profile Modal */}
      {profileMentor && !bookingMentor && (
        <MentorProfileModal
          mentor={profileMentor}
          loading={profileLoading}
          onClose={() => setProfileMentor(null)}
          onBook={(m) => { setBookingMentor(m); setProfileMentor(null); }}
        />
      )}

      {/* Booking Modal */}
      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          startups={startups}
          onClose={() => setBookingMentor(null)}
          onBooked={handleBooked}
          onToast={showToast}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleBookingData && (
        <RescheduleModal
          booking={rescheduleBookingData}
          mentor={{
            id: typeof rescheduleBookingData.mentorId === 'string'
              ? rescheduleBookingData.mentorId
              : rescheduleBookingData.mentorId?._id,
            availability: rescheduleBookingData.mentorId?.availability,
          }}
          onClose={() => setRescheduleBookingData(null)}
          onRescheduled={loadBookings}
          onToast={showToast}
        />
      )}

      {/* Accept Session Payment Modal */}
      {paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          submitting={accepting}
          onClose={() => { if (!accepting) setPaymentBooking(null); }}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {/* Mentor Chat Widget */}
      {chatMentor && (
        <MentorChatWidget
          mentor={chatMentor}
          onClose={() => setChatMentor(null)}
        />
      )}
    </div>
  );
};

export default FounderMentors;
