import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Clock, X, MessageSquare, Send, ArrowLeft, CheckCircle, ChevronRight, Users, UserRound, Star } from 'lucide-react';
import SharedStartupDetailsTabs from '../../../components/shared/SharedStartupDetailsTabs';
import { getDocuments, addNotification, getStartups, updateStartup } from '../../../utils/localStorageHelper';
import { getMentorBookings } from '../../../utils/mentorApi';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';

const MentorReviews: React.FC = () => {
  const { user, getAllUsers } = useAuth();
  const { conversations, messages, getOrCreateConversation, sendMessage } = useChat();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [allStartups, setAllStartups] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedFounder, setSelectedFounder] = useState<any>(null);
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'review' | 'report' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<'Good' | 'Average' | 'Bad' | null>(null);
  const [mentorReplyText, setMentorReplyText] = useState<Record<string, string>>({});
  const [mentorReplying, setMentorReplying] = useState<Record<string, boolean>>({});
  const chatEndRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const initialFounderId = searchParams.get('founderId');
  const initialStartupId = searchParams.get('startupId');
  const initialStartupName = searchParams.get('startupName');

  useEffect(() => {
    const fetchData = async () => {
      const [bks, starts, docs] = await Promise.all([
        getMentorBookings().catch(() => []),
        getStartups(),
        getDocuments(),
      ]);
      setBookings(Array.isArray(bks) ? bks : []);
      setAllStartups(starts);
      setDocuments(docs);
    };
    fetchData();
  }, []);

  const allUsers = getAllUsers();

  // Only founders who selected/booked this mentor appear here.
  const founders = useMemo(() => {
    const map = new Map<string, any>();
    (bookings || []).forEach((b) => {
      if (b.status === 'cancelled') return;
      const f = b.userId;
      const sp = b.startupId;
      if (!f && !sp) return;
      const fid = (typeof f === 'object' ? (f._id || f.id) : (b.founderId || f))?.toString() || (b.founderName ? `founder_${b.founderName}` : null);
      if (!fid) return;
      const sid = (typeof sp === 'object' ? (sp._id || sp.startupId || sp.id) : (sp || b.startupId))?.toString() || (b.startupName ? `startup_${b.startupName}` : null);
      if (!map.has(fid)) {
        const userRec = allUsers.find((u: any) => u.id === fid || u._id === fid || u.fullName === b.founderName);
        map.set(fid, {
          id: fid,
          fullName: (typeof f === 'object' && f.fullName) || b.founderName || userRec?.fullName || 'Founder',
          email: userRec?.email || (typeof f === 'object' && f.email) || '',
          startupsById: new Map(),
        });
      }
      const entry = map.get(fid);
      if (sid && !entry.startupsById.has(sid)) {
        const full = allStartups.find((s: any) => String(s.startupId || s._id || s.id) === sid || s.startupName === b.startupName);
        entry.startupsById.set(sid, full || (typeof sp === 'object' ? { ...sp, startupId: sid, id: sid } : { startupId: sid, id: sid, startupName: b.startupName || 'Startup', startupIdea: b.topic || '' }));
      }
    });

    allStartups.forEach((s: any) => {
      const sid = String(s.startupId || s._id || s.id);
      const fid = String(s.userId || s.founderId || '');
      if (fid && map.has(fid)) {
        const entry = map.get(fid);
        if (!entry.startupsById.has(sid)) {
          entry.startupsById.set(sid, s);
        }
      }
    });

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      startups: Array.from(entry.startupsById.values()),
    }));
  }, [bookings, allStartups, allUsers]);

  // Deep-link support: when arriving with ?founderId&startupId (e.g. from the
  // "View Startup Output" button on the Sessions page or the Mentor dashboard),
  // auto-select the founder and startup card on the page without automatically opening the modal dialog.
  useEffect(() => {
    if (!initialFounderId && !initialStartupId && !initialStartupName) return;

    const sid = initialStartupId ? String(initialStartupId) : '';
    const sname = initialStartupName ? String(initialStartupName) : '';

    const matchId = (s: any) => 
      (sid && String(s.startupId || s._id || s.id) === sid) ||
      (sname && (s.startupName === sname || s.name === sname));

    let f = (sid || sname) ? founders.find(fd => fd.startups.some(matchId)) : undefined;
    if (!f && initialFounderId) f = founders.find(fd => fd.id === String(initialFounderId));

    let st: any = undefined;
    if (f) {
      st = (sid || sname) ? f.startups.find(matchId) : f.startups[0];
    } else if (sid || sname) {
      st = allStartups.find(matchId);
      if (st) {
        const fid = String(st.userId || st.founderId || initialFounderId || 'founder');
        const userRec = allUsers.find((u: any) => u.id === fid || u._id === fid);
        f = {
          id: fid,
          fullName: userRec?.fullName || st.founderName || 'Founder',
          email: userRec?.email || '',
          startups: [st]
        };
      }
    }

    if (f) {
      setSelectedFounder(f);
      if (st) {
        setSelectedStartup(st);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [founders, allStartups, initialFounderId, initialStartupId, initialStartupName, allUsers]);

  const filteredFounders = founders.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.fullName?.toLowerCase().includes(q) || (f.email || '').toLowerCase().includes(q);
  });

  const visibleStartups = selectedFounder ? selectedFounder.startups.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (s.startupName || '').toLowerCase().includes(q) || (s.startupIdea || '').toLowerCase().includes(q);
  }) : [];

  const handleReviewSubmit = () => {
    if (!selectedStartup || !rating) return;
    if (rating !== 'Good' && !feedback) return;

    const review = {
      id: `review_${Date.now()}`,
      startupId: selectedStartup.startupId,
      mentorId: user?.id || '',
      mentorName: user?.fullName || '',
      rating,
      feedback,
      createdAt: new Date().toISOString()
    };

    const updated = { 
      ...selectedStartup, 
      status: 'reviewed', 
      mentorFeedback: feedback,
      mentorReview: review
    };
    
    // Call async update via API wrapper
    updateStartup(updated.startupId || updated._id, updated).then(() => {
      setAllStartups(prev => prev.map(s => (s.startupId || s._id) === (updated.startupId || updated._id) ? updated : s));
    });

    // Send the feedback to the founder as a chat message so it shows up
    // in the founder's Mentors page chat widget.
    const founderId = typeof selectedStartup.founderId === 'string'
      ? selectedStartup.founderId
      : selectedStartup.founderId?._id;
    const founderName = selectedStartup.founderName || 'Founder';
    if (founderId && user) {
      const conv = getOrCreateConversation([
        { id: user.id, name: user.fullName || 'Mentor', role: 'mentor', avatar: (user.fullName || 'M').charAt(0).toUpperCase() },
        { id: founderId, name: founderName, role: 'founder', avatar: (founderName || 'F').charAt(0).toUpperCase() },
      ]);
      const reviewText = feedback.trim()
        ? feedback.trim()
        : `Rating: ${rating}`;
      sendMessage(
        conv.id,
        user.id,
        user.fullName || 'Mentor',
        'Mentor',
        founderId,
        founderName,
        'Founder',
        `[Review for ${selectedStartup.startupName}] ${reviewText}`
      );
    }
    
    addNotification({
      id: `notif_review_${Date.now()}`,
      userId: founderId || 'all',
      title: 'New Mentor Review',
      message: `${user?.fullName || ''} provided a review for "${updated.startupName}": "${feedback || `Rating: ${rating}`}"`,
      type: 'mentor_review',
      actionUrl: '/dashboard/founder/mentor-reviews',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setSelectedStartup(null);
    setModalMode(null);
    setFeedback('');
    setRating(null);
    window.alert('Feedback submitted successfully!');
  };

  // Get conversation messages for a specific founder ↔ mentor startup conversation
  const getConvMessages = (founderId: string, founderName: string, startupName: string) => {
    if (!user || !founderId) return [];
    const conv = conversations.find(c => {
      const ids = c.participants.map(p => p.id).sort().join('|');
      const expected = [user.id, founderId].sort().join('|');
      if (ids === expected) return true;
      const names = c.participants.map(p => (p.name || '').toLowerCase().trim()).sort().join('|');
      const expNames = [user.fullName || '', founderName || ''].map(n => n.toLowerCase().trim()).sort().join('|');
      return names === expNames && names.length > 2;
    });
    if (!conv) return [];
    return (messages[conv.id] || []).filter(m =>
      m.message.includes(startupName) ||
      m.message.toLowerCase().includes('review') ||
      m.message.toLowerCase().includes('feedback') ||
      m.message.toLowerCase().includes('reply') ||
      m.message.toLowerCase().includes('re:')
    );
  };

  const handleMentorReply = async (startup: any, founder: any) => {
    const sid = startup.startupId || startup._id;
    const reply = (mentorReplyText[sid] || '').trim();
    if (!reply || !user) return;
    setMentorReplying(prev => ({ ...prev, [sid]: true }));
    const founderId = founder?.id || startup.founderId || startup.userId;
    const founderName = founder?.fullName || startup.founderName || 'Founder';
    const conv = getOrCreateConversation([
      { id: user.id, name: user.fullName || 'Mentor', role: 'mentor', avatar: (user.fullName || 'M').charAt(0).toUpperCase() },
      { id: founderId || `founder_${founderName}`, name: founderName, role: 'founder', avatar: (founderName || 'F').charAt(0).toUpperCase() },
    ]);
    sendMessage(
      conv.id,
      user.id,
      user.fullName || 'Mentor',
      'Mentor',
      founderId || `founder_${founderName}`,
      founderName,
      'Founder',
      `[Re: ${startup.startupName}] ${reply}`
    );
    addNotification({
      id: `notif_mreply_${Date.now()}`,
      userId: founderId || 'founder',
      title: 'New Message from Mentor',
      message: `${user.fullName || 'Mentor'} replied on "${startup.startupName}": "${reply}"`,
      type: 'mentor_message',
      isRead: false,
      actionUrl: '/dashboard/founder/mentor-reviews',
      createdAt: new Date().toISOString(),
    });
    setMentorReplyText(prev => ({ ...prev, [sid]: '' }));
    setMentorReplying(prev => ({ ...prev, [sid]: false }));
    setTimeout(() => { chatEndRefs.current[sid]?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  const renderStartupCard = (startup: any, idx: number) => {
    const sid = startup.startupId || startup._id;
    const founderId = selectedFounder?.id || startup.founderId || startup.userId;
    const founderName = selectedFounder?.fullName || startup.founderName || 'Founder';
    const convMessages = getConvMessages(founderId, founderName, startup.startupName);
    const formatTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

    return (
    <div key={`${sid || idx}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{startup.startupName}</h3>
              {startup.status !== 'reviewed' && <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Action Required</span>}
              {startup.mentorReview?.rating && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  startup.mentorReview.rating === 'Good' ? 'bg-green-100 text-green-700 border-green-200' :
                  startup.mentorReview.rating === 'Average' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }`}>{startup.mentorReview.rating}</span>
              )}
              {convMessages.length > 0 && (
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {convMessages.length} msg{convMessages.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">{startup.startupIdea}</p>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-2 shrink-0 md:pl-4">
            <button
              onClick={() => { setSelectedStartup(startup); setModalMode('review'); }}
              className="w-full md:w-40 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
            >
              {startup.mentorReview?.feedback ? 'Update Review' : 'Review Startup'}
            </button>
            <button
              onClick={() => { setSelectedStartup(startup); setModalMode('report'); }}
              className="w-full md:w-40 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-sm transition-colors shadow-sm"
            >
              View AI Report
            </button>
          </div>
        </div>
      </div>

      {/* Conversation thread */}
      <div className="border-t border-gray-100 bg-[#FAFAFA]">
        <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100">
          <MessageSquare size={14} className="text-[#5B21B6]" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conversation with {founderName}</span>
        </div>

        {/* Messages */}
        <div className="px-5 py-4 space-y-3 max-h-60 overflow-y-auto">
          {/* Initial review as seed message */}
          {startup.mentorReview?.feedback && (
            <div className="flex items-start gap-3 justify-end">
              <div className="flex-1 flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1 flex-row-reverse">
                  <span className="text-xs font-bold text-gray-700">{user?.fullName || 'You'}</span>
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">You (Mentor)</span>
                  {startup.mentorReview.createdAt && <span className="text-[10px] text-gray-400">{formatTime(startup.mentorReview.createdAt)}</span>}
                </div>
                <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white shadow-md max-w-[80%]">
                  {startup.mentorReview.feedback}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#FBBF24] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(user?.fullName || 'M').charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Legacy founder one-time reply */}
          {startup.mentorReview?.founderReply && !convMessages.some((m: any) => m.receiverId === user?.id || m.senderName?.toLowerCase() !== (user?.fullName || '').toLowerCase()) && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(founderName || 'F').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-700">{founderName}</span>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Founder</span>
                  {startup.mentorReview.founderReplyAt && <span className="text-[10px] text-gray-400">{formatTime(startup.mentorReview.founderReplyAt)}</span>}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-700 shadow-sm">
                  {startup.mentorReview.founderReply}
                </div>
              </div>
            </div>
          )}

          {/* Live chat messages */}
          {convMessages.map((m: any, i: number) => {
            const isMentor = m.senderId === user?.id || (user?.fullName && m.senderName?.toLowerCase() === user.fullName.toLowerCase());
            return (
              <div key={i} className={`flex items-start gap-3 ${isMentor ? 'justify-end' : ''}`}>
                {!isMentor && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(m.senderName || 'F').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`flex-1 flex flex-col ${isMentor ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isMentor ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-bold text-gray-700">{isMentor ? (user?.fullName || 'You') : m.senderName}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isMentor ? 'text-purple-500' : 'text-amber-500'}`}>{isMentor ? 'You' : 'Founder'}</span>
                    <span className="text-[10px] text-gray-400">{formatTime(m.createdAt)}</span>
                  </div>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMentor
                      ? 'bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-tr-sm'
                      : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
                  }`}>
                    {m.message.replace(/^\[Re: [^\]]+\] /, '').replace(/^\[Review for [^\]]+\] /, '')}
                  </div>
                </div>
                {isMentor && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B21B6] to-[#FBBF24] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(user?.fullName || 'M').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={el => { chatEndRefs.current[sid] = el; }} />
        </div>

        {/* Reply input */}
        <div className="border-t border-gray-200 px-5 py-3 bg-white flex gap-3 items-end">
          <textarea
            value={mentorReplyText[sid] || ''}
            onChange={e => setMentorReplyText(prev => ({ ...prev, [sid]: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleMentorReply(startup, selectedFounder); } }}
            rows={2}
            placeholder={`Reply to ${founderName}... (Enter to send)`}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B21B6] bg-gray-50 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleMentorReply(startup, selectedFounder)}
            disabled={mentorReplying[sid] || !(mentorReplyText[sid] || '').trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-sm flex-shrink-0"
          >
            {mentorReplying[sid] ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
            Reply
          </button>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Startups to Review</h1>
        <p className="text-gray-500 mt-1">Only founders who selected you as their mentor appear here. Select a founder to review their startup output.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={selectedFounder ? "Search startups..." : "Search founders..."} 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B21B6] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Founders List (selected mentor's founders) */}
      {!selectedFounder ? (
        founders.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            <Users size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-700 mb-1">No founders selected you yet</p>
            <p className="text-sm">When a founder books you as their mentor, their startup will appear here for review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFounders.map((f) => (
              <button
                key={f.id}
                onClick={() => { setSelectedFounder(f); setSearch(''); }}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-[#5B21B6]/30 transition-all text-left group flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                    {(f.fullName || 'F').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{f.fullName}</h3>
                    <p className="text-xs text-gray-500 truncate">{f.email || 'Founder'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star size={14} className="text-[#5B21B6]" />
                    <span className="font-bold text-gray-900">{f.startups.length}</span>
                    <span>{f.startups.length === 1 ? 'startup' : 'startups'} to review</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold text-[#5B21B6] group-hover:gap-2 transition-all">
                    View <ChevronRight size={16} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        <>
          {/* Selected Founder Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setSelectedFounder(null); setSearch(''); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                  title="Back to founders"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                  {(selectedFounder.fullName || 'F').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <UserRound size={18} className="text-[#5B21B6]" /> {selectedFounder.fullName}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedFounder.email || 'Founder'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">{selectedFounder.startups.length}</span>
                {selectedFounder.startups.length === 1 ? 'startup' : 'startups'} to review
              </div>
            </div>
          </div>

          {/* Selected Founder's Startups */}
          {visibleStartups.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-gray-200 text-gray-500">
              No startups match your search.
            </div>
          ) : (
            <div className="space-y-4">
              {visibleStartups.map((startup, idx) => renderStartupCard(startup, idx))}
            </div>
          )}
        </>
      )}

      {/* Modal Overlay */}
      {modalMode && selectedStartup && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-[95%] lg:w-full max-w-[1200px] max-h-[90vh] flex flex-col rounded-[24px] shadow-xl animate-fade-in-up overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex items-center gap-4 shrink-0 z-10">
              <button 
                onClick={() => { setModalMode(null); setSelectedStartup(null); setFeedback(''); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex-1">
                <h2 className="text-[22px] font-bold text-gray-900">
                  {modalMode === 'review' ? 'Provide Expert Review' : 'AI Analysis Report'}
                </h2>
                <p className="text-[15px] text-gray-500 mt-1">{selectedStartup.startupName}</p>
              </div>
              <button 
                onClick={() => { setModalMode(null); setSelectedStartup(null); setFeedback(''); }}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              {modalMode === 'report' ? (
                <div className="space-y-8">
                  {/* Shared Documents Section */}
                  {documents.filter(d => d.startupId === selectedStartup.startupId && d.sharedWith?.includes('mentor')).length > 0 && (
                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Shared Documents</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {documents.filter(d => d.startupId === selectedStartup.startupId && d.sharedWith?.includes('mentor')).map((doc: any) => (
                          <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                              <p className="font-bold text-sm text-gray-800 line-clamp-1">{doc.fileName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{doc.category} • {doc.fileSize}</p>
                            </div>
                            <button onClick={() => window.alert(`Downloading ${doc.fileName}...`)} className="px-3 py-1.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg transition-colors">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <SharedStartupDetailsTabs startupData={selectedStartup} />
                  
                  <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between gap-3">
                    <button 
                      onClick={() => { setModalMode(null); setSelectedStartup(null); setFeedback(''); }}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors flex items-center"
                    >
                      <ArrowLeft size={16} className="mr-2" /> Back
                    </button>
                    <button 
                      onClick={() => setModalMode('review')}
                      className="px-6 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center"
                    >
                      <MessageSquare size={16} className="mr-2" /> Provide Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700 italic border-l-2 border-[#5B21B6] pl-3">"{selectedStartup.startupIdea}"</p>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mentor Rating</label>
                    <div className="flex gap-3">
                      {['Good', 'Average', 'Bad'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRating(r as any)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                            rating === r 
                              ? r === 'Good' ? 'bg-green-500 text-white border-green-500 shadow-md' :
                                r === 'Average' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md' :
                                'bg-red-500 text-white border-red-500 shadow-md'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#5B21B6]" /> 
                      Your Feedback & Recommendations 
                      {rating === 'Good' ? <span className="text-gray-400 font-normal text-xs">(Optional)</span> : <span className="text-red-500 font-normal text-xs">* Required</span>}
                    </label>
                    <textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write your expert advice, actionable steps, and general feedback for the founder..."
                      className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent text-sm resize-none transition-shadow"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => { setModalMode(null); setSelectedStartup(null); setFeedback(''); setRating(null); }}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReviewSubmit}
                      disabled={!rating || (rating !== 'Good' && !feedback)}
                      className="flex items-center px-6 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                    >
                      <Send size={16} className="mr-2" /> Submit Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorReviews;
