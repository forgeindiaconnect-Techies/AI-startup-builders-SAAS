import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video, Calendar, Clock, Loader2, X, CheckCircle2, CalendarClock,
  FileText, ArrowRight, Link2, MessageSquare, GraduationCap, MapPin, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  getMentorBookings,
  getMentorAvailability,
  scheduleMentorSession,
  completeSession,
} from '../../../utils/mentorApi';

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

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: 'Awaiting Schedule', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Scheduled', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
  rescheduled: { label: 'Rescheduled', className: 'bg-purple-50 text-[#5B21B6] border-purple-200' },
};

const startupNameOf = (b: any) => {
  const s = b?.startupId;
  return s && typeof s === 'object' && s.startupName ? s.startupName : b?.startupName || 'Startup';
};

const founderNameOf = (b: any) => {
  const u = b?.userId;
  return u && typeof u === 'object' && u.fullName ? u.fullName : b?.founderName || 'Founder';
};

const viewStartupOutput = (b: any, navigate: (to: string) => void) => {
  const sp = b?.startupId;
  const sid = sp && typeof sp === 'object' ? (sp._id || sp.startupId) : sp;
  const f = b?.userId;
  const fid = f && typeof f === 'object' ? f._id : b?.founderId;
  const params = new URLSearchParams();
  if (fid) params.set('founderId', String(fid));
  if (sid) params.set('startupId', String(sid));
  navigate(`/dashboard/mentor/reviews?${params.toString()}`);
};

// ─── Schedule Modal ──────────────────────────────────────────────
const ScheduleModal: React.FC<{
  booking: any;
  mentorId: string;
  onClose: () => void;
  onScheduled: () => void;
  onToast: (type: 'success' | 'error', message: string) => void;
}> = ({ booking, mentorId, onClose, onScheduled, onToast }) => {
  const [availability, setAvailability] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingLink, setMeetingLink] = useState(booking.meetingLink || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getMentorAvailability(mentorId)
      .then((data) => {
        if (!active) return;
        setAvailability(data.availability?.length ? data.availability : []);
        setBookedSlots(data.booked || {});
      })
      .catch(() => active && (setAvailability([]), setBookedSlots({})))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [mentorId]);

  const dateSlots = availability.find((a) => a.date === selectedDate)?.slots || [];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const finalLink = (meetingLink.trim() || booking.meetingLink || '').trim();
      await scheduleMentorSession(booking._id, { date: selectedDate, time: selectedTime, meetingLink: finalLink });
      onScheduled();
      onToast('success', 'Session scheduled — the founder has been notified.');
      onClose();
    } catch (err: any) {
      onToast('error', err.message || 'Failed to schedule the session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-bold text-gray-900">Schedule Session</h2>
            <p className="text-xs text-gray-500 mt-0.5">Set the date and time slot for {founderNameOf(booking)} · {startupNameOf(booking)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Requested Topic</p>
            <p className="font-bold text-gray-900">{booking.topic}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={26} className="animate-spin text-[#5B21B6]" /></div>
          ) : availability.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl">
              No availability set. Please ask the admin to configure your available days and time slots.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Day / Date</label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {availability.map((a) => {
                    const allBooked = (a.slots || []).every((s: string) => (bookedSlots[a.date] || []).includes(s));
                    const busy = allBooked;
                    return (
                      <button
                        key={a.date}
                        disabled={busy}
                        onClick={() => { setSelectedDate(a.date); setSelectedTime(''); }}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          selectedDate === a.date
                            ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6]'
                            : busy
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
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {dateSlots.map((t: string) => {
                      const busy = (bookedSlots[selectedDate] || []).includes(t);
                      return (
                        <button
                          key={t}
                          disabled={busy}
                          onClick={() => setSelectedTime(t)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            selectedTime === t
                              ? 'border-[#5B21B6] bg-purple-50 text-[#5B21B6]'
                              : busy
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

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Meeting Link</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.jit.si/your-meeting-room"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20 focus:border-[#5B21B6] transition-all"
                />
              </div>
              {meetingLink.trim() && (
                <a
                  href={meetingLink.trim().match(/^https?:\/\//) ? meetingLink.trim() : `https://${meetingLink.trim()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={14} /> Open
                </a>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">A default meeting link is auto-generated. The founder can join it from their bookings.</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || !meetingLink.trim() || submitting}
            className="px-6 py-2.5 bg-[#5B21B6] text-white font-bold rounded-xl hover:bg-[#4C1D95] transition-colors text-sm shadow flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarClock size={16} />} Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────
const MentorSessions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleTarget, setScheduleTarget] = useState<any>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBookings = async () => {
    try {
      const data = await getMentorBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = async (b: any) => {
    if (!window.confirm('Mark this session as completed?')) return;
    setCompletingId(b._id);
    try {
      await completeSession(b._id);
      showToast('success', 'Session marked as completed.');
      loadBookings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to complete the session');
    } finally {
      setCompletingId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const scheduledBookings = bookings.filter((b) => ['confirmed', 'accepted'].includes(b.status));
  const pastBookings = bookings.filter((b) => ['completed', 'cancelled', 'rescheduled'].includes(b.status));

  return (
    <div className="animate-fade-in-up pb-12">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-fade-in-up">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold ${
            toast.type === 'success' ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-700'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <X size={18} className="text-red-600 shrink-0" />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mentor Sessions</h1>
        <p className="text-gray-500 mt-1">Founders request sessions here. Set the date, time slot, and review their startup output.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#5B21B6]" /></div>
      ) : (
        <>
          {/* ── Pending Requests ── */}
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CalendarClock size={18} className="text-amber-500" /> New Session Requests
              {pendingBookings.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-amber-100 text-amber-700">{pendingBookings.length}</span>
              )}
            </h2>

            {pendingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <CalendarClock size={36} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No new session requests.</p>
                <p className="text-sm text-gray-400 mt-1">When a founder books a session, the request will appear here for you to schedule.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((b) => (
                  <div key={b._id} className="bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <Video size={22} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-gray-900">{founderNameOf(b)}</p>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">Awaiting Schedule</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">
                            <span className="font-semibold text-gray-800">Startup:</span> {startupNameOf(b)}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs font-semibold text-gray-500">
                            <span className="flex items-center gap-1"><MessageSquare size={13} className="text-gray-400" /> {b.topic}</span>
                            <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /> {b.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => viewStartupOutput(b, navigate)}
                          className="px-3.5 py-2 text-sm font-bold text-[#5B21B6] bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <FileText size={14} /> View Startup Output
                        </button>
                        <button
                          onClick={() => setScheduleTarget(b)}
                          className="px-3.5 py-2 text-sm font-bold text-white bg-[#5B21B6] hover:bg-[#4C1D95] rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <CalendarClock size={14} /> Schedule Session
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Upcoming Scheduled ── */}
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-[#5B21B6]" /> Scheduled & Accepted Sessions
              {scheduledBookings.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-purple-100 text-[#5B21B6]">{scheduledBookings.length}</span>
              )}
            </h2>

            {scheduledBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <Calendar size={36} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No scheduled sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledBookings.map((b) => {
                  const meta = STATUS_META[b.status] || STATUS_META.pending;
                  return (
                    <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#5B21B6] flex items-center justify-center flex-shrink-0">
                            <Video size={22} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-gray-900">{founderNameOf(b)}</p>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.className}`}>{meta.label}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
                              <span className="font-semibold text-gray-800">Startup:</span> {startupNameOf(b)}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs font-semibold text-gray-500">
                              <span className="flex items-center gap-1"><MessageSquare size={13} className="text-gray-400" /> {b.topic}</span>
                              <span className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" /> {formatDateDisplay(b.date)}</span>
                              <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /> {formatTimeDisplay(b.time)} · {b.duration} min</span>
                            </div>
                            {b.meetingLink && (
                              <a href={b.meetingLink} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#5B21B6] font-bold hover:underline">
                                <Link2 size={12} /> Join meeting link
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={() => viewStartupOutput(b, navigate)}
                            className="px-3.5 py-2 text-sm font-bold text-[#5B21B6] bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <FileText size={14} /> View Startup Output
                          </button>
                          {['confirmed', 'accepted'].includes(b.status) && (
                            <button
                              onClick={() => handleComplete(b)}
                              disabled={completingId === b._id}
                              className="px-3.5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-60"
                            >
                              {completingId === b._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Complete Session
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Past Sessions ── */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-gray-400" /> Past Sessions
              </h2>
              <div className="space-y-4">
                {pastBookings.map((b) => {
                  const meta = STATUS_META[b.status] || STATUS_META.pending;
                  return (
                    <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                          <Video size={22} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-gray-900">{founderNameOf(b)}</p>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.className}`}>{meta.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">
                            <span className="font-semibold text-gray-800">Startup:</span> {startupNameOf(b)}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs font-semibold text-gray-500">
                            <span className="flex items-center gap-1"><MessageSquare size={13} className="text-gray-400" /> {b.topic}</span>
                            {b.date && (
                              <>
                                <span className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" /> {formatDateDisplay(b.date)}</span>
                                <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /> {formatTimeDisplay(b.time)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="ml-auto shrink-0">
                          <button
                            onClick={() => viewStartupOutput(b, navigate)}
                            className="px-3.5 py-2 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            Review Startup <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {scheduleTarget && (
        <ScheduleModal
          booking={scheduleTarget}
          mentorId={user?.id || ''}
          onClose={() => setScheduleTarget(null)}
          onScheduled={loadBookings}
          onToast={showToast}
        />
      )}
    </div>
  );
};

export default MentorSessions;
