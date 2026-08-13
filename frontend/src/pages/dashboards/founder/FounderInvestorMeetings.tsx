import React, { useState, useEffect } from 'react';
import {
  CalendarClock, Video, Plus, CheckCircle2, Clock, XCircle,
  ExternalLink, Building2, User, X, AlertCircle, Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getStartups } from '../../../utils/localStorageHelper';
import {
  getInvestmentRequests, getInvestorMeetings, createInvestorMeeting,
  updateMeetingStatus
} from '../../../utils/investorModuleStorage';
import type { InvestorMeeting, InvestmentRequest } from '../../../utils/investorModuleStorage';

const FounderInvestorMeetings: React.FC = () => {
  const { user } = useAuth();
  const founderEmail = user?.email || 'renugopal24022000@gmail.com';

  const [meetings, setMeetings] = useState<InvestorMeeting[]>([]);
  const [connectedRequests, setConnectedRequests] = useState<InvestmentRequest[]>([]);
  const [startups, setStartups] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form state
  const [selectedInvestorEmail, setSelectedInvestorEmail] = useState('');
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('14:00');
  const [agenda, setAgenda] = useState('Introductory Pitch & Investment Term Sheet Discussion');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    const allMeetings = getInvestorMeetings();
    setMeetings(allMeetings);

    const requests = getInvestmentRequests();
    const accepted = requests.filter(r => r.status === 'ACCEPTED');
    setConnectedRequests(accepted);

    if (accepted.length > 0 && !selectedInvestorEmail) {
      setSelectedInvestorEmail(accepted[0].investorEmail);
    }

    const userStartups = await getStartups();
    setStartups(userStartups);
    if (userStartups.length > 0 && !selectedStartupId) {
      setSelectedStartupId(userStartups[0].id || userStartups[0].startupId);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('investor_meetings_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('investor_meetings_updated', loadData);
    };
  }, []);

  const filteredMeetings = meetings.filter(
    m => activeTab === 'All' || m.status === activeTab
  );

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetReq = connectedRequests.find(r => r.investorEmail === selectedInvestorEmail);
    const targetStartup = startups.find(s => (s.id === selectedStartupId || s.startupId === selectedStartupId));

    if (!targetReq || !targetStartup) {
      showToast('Please select a valid connected investor and startup.', 'error');
      return;
    }

    createInvestorMeeting({
      founderEmail,
      founderName: user?.fullName || 'Founder',
      investorEmail: targetReq.investorEmail,
      investorName: targetReq.investorName,
      investorFirm: targetReq.investorFirm,
      startupId: targetStartup.id || targetStartup.startupId,
      startupName: targetStartup.startupName || 'Startup',
      proposedDate: proposedDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      proposedTime,
      agenda,
    });

    showToast(`Meeting scheduled with ${targetReq.investorName}!`, 'success');
    setShowScheduleModal(false);
    loadData();
  };

  const handleStatusChange = (meetingId: string, status: InvestorMeeting['status']) => {
    updateMeetingStatus(meetingId, status);
    showToast(`Meeting status updated to ${status}.`);
    loadData();
  };

  const getStatusBadge = (status: InvestorMeeting['status']) => {
    switch (status) {
      case 'Scheduled':
        return (
          <span className="px-3 py-1 bg-[#5B21B6] text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <CheckCircle2 size={12} /> Scheduled
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} /> Requested
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <CalendarClock className="text-[#5B21B6]" size={28} /> Investor Meetings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule and join 1-on-1 video meetings with interested investors.
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          disabled={connectedRequests.length === 0}
          className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm mb-6 flex gap-2 overflow-x-auto">
        {(['All', 'Scheduled', 'Completed', 'Cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-[#5B21B6] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Meetings Grid */}
      {filteredMeetings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <CalendarIcon size={44} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-800">No meetings found</h3>
          <p className="text-xs text-gray-500 mt-1">
            {connectedRequests.length === 0
              ? 'You need an accepted proposal from an investor before scheduling a meeting.'
              : 'Schedule your first meeting using the button above!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMeetings.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-lg font-black shadow shrink-0">
                      {m.investorName ? m.investorName.charAt(0).toUpperCase() : 'I'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{m.investorName}</h3>
                      <p className="text-xs text-gray-500 font-medium">{m.investorFirm}</p>
                    </div>
                  </div>
                  {getStatusBadge(m.status)}
                </div>

                <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 mb-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="text-[#5B21B6]">{m.startupName}</span>
                    <span className="text-gray-700">{m.proposedDate} at {m.proposedTime}</span>
                  </div>
                  <p className="text-gray-600 text-xs italic">Agenda: "{m.agenda}"</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                {m.status === 'Scheduled' && m.meetingLink ? (
                  <a
                    href={m.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Video size={14} /> Join Video Meeting
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">No active link</span>
                )}

                <div className="flex items-center gap-2">
                  {m.status === 'Scheduled' && (
                    <button
                      onClick={() => handleStatusChange(m.id, 'Completed')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                  {m.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleStatusChange(m.id, 'Cancelled')}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── SCHEDULE MEETING MODAL ─── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 bg-purple-100 text-[#5B21B6] rounded-full text-xs font-black uppercase tracking-wider inline-block mb-2">
                1-on-1 Pitch Session
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Schedule Investor Meeting</h2>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Select Connected Investor *</label>
                <select
                  value={selectedInvestorEmail}
                  onChange={(e) => setSelectedInvestorEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                >
                  {connectedRequests.map((req) => (
                    <option key={req.id} value={req.investorEmail}>
                      {req.investorName} ({req.investorFirm}) — Startup: {req.startupName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Select Startup *</label>
                <select
                  value={selectedStartupId}
                  onChange={(e) => setSelectedStartupId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                >
                  {startups.map((s) => (
                    <option key={s.id || s.startupId} value={s.id || s.startupId}>
                      {s.startupName || 'Startup'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Date *</label>
                  <input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Time Slot *</label>
                  <input
                    type="time"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Agenda / Meeting Topic *</label>
                <textarea
                  rows={2}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Introductory pitch, term sheet discussion, due diligence q&a..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#5B21B6]"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderInvestorMeetings;
