import { Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import MentorProfile, { IMentorProfile } from '../models/MentorProfile.js';
import MentorBooking from '../models/MentorBooking.js';
import MentorFeedback from '../models/MentorFeedback.js';
import Startup from '../models/Startup.js';
import NotificationModel from '../models/Notification.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const isValidId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const MENTOR_CATEGORIES = [
  'Finance',
  'Marketing',
  'Sales',
  'Product Development',
  'Technology',
  'Business Strategy',
  'Legal',
  'Fundraising',
  'Operations',
];

export const SESSION_TOPICS = [
  'Financial Planning',
  'Fundraising Strategy',
  'Business Model Review',
  'Go-to-Market Strategy',
  'Product Roadmap',
  'Pricing Strategy',
  'Pitch Deck Review',
  'Growth & Marketing',
  'Sales Strategy',
  'Legal & Compliance',
  'Operations & Scaling',
  'Team Building',
];

const BOOKABLE_STATUSES = ['pending', 'confirmed', 'rescheduled'] as const;

// ─── Helpers ──────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultAvailability(days = 14): Array<{ date: string; slots: string[] }> {
  const availability: Array<{ date: string; slots: string[] }> = [];
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    availability.push({
      date: formatDate(d),
      slots: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'],
    });
  }
  return availability;
}

function guessCategories(expertise: string[]): string[] {
  const text = expertise.join(' ').toLowerCase();
  const map: Array<[string, string[]]> = [
    ['Finance', ['finance', 'financial', 'account', 'tax', 'cfo', 'capital', 'budget', 'valuation', 'bookkeep']],
    ['Marketing', ['market', 'brand', 'growth', 'social', 'content', 'seo', 'ads', 'campaign', 'communicat']],
    ['Sales', ['sales', 'revenue', 'b2b', 'b2c', 'crm', 'outbound', 'pipeline', 'closing']],
    ['Product Development', ['product', 'mvp', 'prototype', 'ux', 'ui', 'design', 'roadmap', 'feature']],
    ['Technology', ['technology', 'tech', 'saas', 'software', 'ai', 'ml', 'cloud', 'data', 'architecture', 'api', 'backend', 'frontend', 'developer']],
    ['Business Strategy', ['strategy', 'business model', 'consult', 'planning', 'pivot', 'management']],
    ['Legal', ['legal', 'law', 'compliance', 'contract', 'trademark', 'ip ', 'regulatory', 'founder agreement']],
    ['Fundraising', ['fundraising', 'fund', 'investor', 'pitch', 'vc ', 'seed', 'term sheet', 'raise']],
    ['Operations', ['operation', 'supply chain', 'logistics', 'hiring', 'team', 'hr ', 'process', 'scaling']],
  ];
  const found: string[] = [];
  for (const [cat, kws] of map) {
    if (kws.some((k) => text.includes(k)) && !found.includes(cat)) found.push(cat);
  }
  if (found.length === 0) found.push('Business Strategy');
  return found;
}

function buildMentorView(user: any, profile: IMentorProfile | null) {
  const expertise = profile?.expertise?.length
    ? profile.expertise
    : (user.expertise || '').split(',').map((s: string) => s.trim()).filter(Boolean);

  return {
    id: user._id,
    name: user.fullName,
    title: profile?.title || 'Startup Mentor',
    photoUrl: profile?.photoUrl || '',
    experienceYears: profile?.experienceYears || parseInt(user.experienceYears || '0', 10) || 8,
    expertise: expertise.length ? expertise : ['Startup Guidance'],
    categories: profile?.categories?.length ? profile.categories : guessCategories(expertise),
    industry: profile?.industry || user.industry || '',
    bio: profile?.bio || user.bio || 'Experienced mentor helping founders build and scale successful startups.',
    linkedin: profile?.linkedin || user.linkedin || '',
    location: profile?.location || user.location || '',
    rating: profile?.rating ?? 4.8,
    reviewsCount: profile?.reviewsCount ?? 0,
    sessionDuration: profile?.sessionDuration ?? 45,
    sessionFee: profile?.sessionFee ?? 0,
    availability: profile?.availability?.length ? profile.availability : defaultAvailability(),
    isActive: profile?.isActive ?? true,
  };
}

// ─── Demo mentors (seeded only if no mentors exist) ───────────────

const DEMO_MENTORS = [
  {
    fullName: 'Priya Raghavan',
    email: 'priya.finance@ai-startup-builder.com',
    title: 'Finance & Fundraising Mentor',
    expertise: ['Financial Planning', 'Fundraising', 'Valuation', 'Pitch Decks'],
    industry: 'SaaS / FinTech',
    bio: 'Ex-investment banker with 12+ years of experience helping founders raise seed and Series A rounds. Advisor to 30+ funded startups across India.',
    experienceYears: 12,
    linkedin: 'https://linkedin.com/in/priya-finance-mentor',
    location: 'Bengaluru, India',
    categories: ['Finance', 'Fundraising'],
    sessionFee: 1500,
    rating: 4.9,
    reviewsCount: 32,
  },
  {
    fullName: 'Arjun Mehta',
    email: 'arjun.marketing@ai-startup-builder.com',
    title: 'Growth & Marketing Mentor',
    expertise: ['Go-to-Market', 'Brand Strategy', 'Performance Marketing', 'Content'],
    industry: 'Consumer / D2C',
    bio: 'Growth leader behind 3 unicorn D2C brands. Specializes in customer acquisition, retention loops, and zero-to-one go-to-market plays.',
    experienceYears: 10,
    linkedin: 'https://linkedin.com/in/arjun-growth-mentor',
    location: 'Mumbai, India',
    categories: ['Marketing', 'Sales'],
    sessionFee: 1200,
    rating: 4.8,
    reviewsCount: 27,
  },
  {
    fullName: 'Neha Sharma',
    email: 'neha.sales@ai-startup-builder.com',
    title: 'Sales & Revenue Mentor',
    expertise: ['Enterprise Sales', 'Sales Team Building', 'Pricing', 'Negotiation'],
    industry: 'B2B SaaS',
    bio: 'Former VP of Sales at a Series C SaaS company. Built and scaled sales orgs from 0 to 200+ customers in under 18 months.',
    experienceYears: 9,
    linkedin: 'https://linkedin.com/in/neha-sales-mentor',
    location: 'Gurugram, India',
    categories: ['Sales'],
    sessionFee: 1300,
    rating: 4.9,
    reviewsCount: 21,
  },
  {
    fullName: 'Rohan Iyer',
    email: 'rohan.product@ai-startup-builder.com',
    title: 'Product Development Mentor',
    expertise: ['Product Strategy', 'MVP Design', 'User Research', 'Roadmapping'],
    industry: 'Technology',
    bio: 'Product leader who shipped 20+ consumer and enterprise products. Helps founders go from idea to launch-ready MVP with confidence.',
    experienceYears: 11,
    linkedin: 'https://linkedin.com/in/rohan-product-mentor',
    location: 'Pune, India',
    categories: ['Product Development', 'Technology'],
    sessionFee: 1400,
    rating: 4.7,
    reviewsCount: 18,
  },
  {
    fullName: 'Kavitha Nair',
    email: 'kavitha.tech@ai-startup-builder.com',
    title: 'Technology & Engineering Mentor',
    expertise: ['Software Architecture', 'AI / ML', 'Cloud', 'Tech Team Hiring'],
    industry: 'SaaS / AI',
    bio: 'CTO of a profitable AI startup. Guides founders on tech architecture, engineering hiring, and building scalable AI-first products.',
    experienceYears: 14,
    linkedin: 'https://linkedin.com/in/kavitha-tech-mentor',
    location: 'Chennai, India',
    categories: ['Technology'],
    sessionFee: 1600,
    rating: 4.9,
    reviewsCount: 40,
  },
  {
    fullName: 'Vikram Malhotra',
    email: 'vikram.strategy@ai-startup-builder.com',
    title: 'Business Strategy Mentor',
    expertise: ['Business Model Design', 'Market Entry', 'Pivots', 'Board Advisory'],
    industry: 'Multi-sector',
    bio: 'Strategy consultant and 2x founder. Advises startups on business model clarity, market positioning, and sustainable growth.',
    experienceYears: 15,
    linkedin: 'https://linkedin.com/in/vikram-strategy-mentor',
    location: 'Delhi, India',
    categories: ['Business Strategy', 'Operations'],
    sessionFee: 1500,
    rating: 4.8,
    reviewsCount: 25,
  },
  {
    fullName: 'Ananya Reddy',
    email: 'ananya.legal@ai-startup-builder.com',
    title: 'Legal & Compliance Mentor',
    expertise: ['Company Incorporation', 'Founder Agreements', 'IP Protection', 'Regulatory Compliance'],
    industry: 'Multi-sector',
    bio: 'Corporate lawyer specializing in startup law. Helped 100+ startups incorporate, raise, and stay compliant through every stage.',
    experienceYears: 8,
    linkedin: 'https://linkedin.com/in/ananya-legal-mentor',
    location: 'Hyderabad, India',
    categories: ['Legal'],
    sessionFee: 1100,
    rating: 4.9,
    reviewsCount: 35,
  },
  {
    fullName: 'Aditya Kulkarni',
    email: 'aditya.fundraising@ai-startup-builder.com',
    title: 'Fundraising Mentor',
    expertise: ['Term Sheets', 'Investor Outreach', 'Cap Table', 'Due Diligence'],
    industry: 'Startups / VC',
    bio: 'Former VC partner who has reviewed 2,000+ pitch decks. Guides founders through every step of the fundraising journey.',
    experienceYears: 13,
    linkedin: 'https://linkedin.com/in/aditya-fundraising-mentor',
    location: 'Bengaluru, India',
    categories: ['Fundraising', 'Finance'],
    sessionFee: 1700,
    rating: 5.0,
    reviewsCount: 48,
  },
  {
    fullName: 'Sneha Pillai',
    email: 'sneha.ops@ai-startup-builder.com',
    title: 'Operations & Scaling Mentor',
    expertise: ['Process Design', 'Supply Chain', 'Hiring', 'Unit Economics'],
    industry: 'D2C / E-commerce',
    bio: 'COO at a fast-scaling e-commerce brand. Specializes in operational rigor, hiring playbooks, and profitable scaling.',
    experienceYears: 10,
    linkedin: 'https://linkedin.com/in/sneha-ops-mentor',
    location: 'Kochi, India',
    categories: ['Operations', 'Sales'],
    sessionFee: 1200,
    rating: 4.7,
    reviewsCount: 22,
  },
];

async function seedDemoMentors(): Promise<void> {
  try {
    const count = await User.countDocuments({ role: 'mentor' });
    if (count > 0) return;

    const passwordHash = await bcrypt.hash('Mentor@123', 10);
    for (const m of DEMO_MENTORS) {
      const existing = await User.findOne({ email: m.email });
      if (existing) continue;
      const user = await User.create({
        fullName: m.fullName,
        email: m.email,
        passwordHash,
        role: 'mentor',
        isVerified: true,
        status: 'active',
        approvalStatus: 'approved',
        expertise: m.expertise.join(', '),
        experienceYears: `${m.experienceYears}+`,
        linkedin: m.linkedin,
        bio: m.bio,
        location: m.location,
      });
      await MentorProfile.create({
        mentorId: user._id,
        title: m.title,
        expertise: m.expertise,
        industry: m.industry,
        categories: m.categories,
        bio: m.bio,
        experienceYears: m.experienceYears,
        linkedin: m.linkedin,
        location: m.location,
        rating: m.rating,
        reviewsCount: m.reviewsCount,
        sessionDuration: 45,
        sessionFee: m.sessionFee,
        isActive: true,
        availability: defaultAvailability(14),
      });
    }
  } catch (err) {
    console.error('Error seeding demo mentors:', (err as Error).message);
  }
}

// ─── Controllers ──────────────────────────────────────────────────

// GET /api/mentors
export const getAvailableMentors = async (req: AuthRequest, res: Response) => {
  try {
    await seedDemoMentors();
    const mentors = await User.find({ role: 'mentor', status: 'active', approvalStatus: 'approved' });
    const profiles = await MentorProfile.find({ mentorId: { $in: mentors.map((m) => m._id) } });
    const profileMap = new Map(profiles.map((p) => [p.mentorId.toString(), p]));
    const list = mentors.map((m) => buildMentorView(m, profileMap.get(m._id.toString()) ?? null));
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentors' });
  }
};

// GET /api/mentors/:id
export const getMentorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid mentor id' });
    const mentor = await User.findOne({ _id: id, role: 'mentor' });
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });
    const profile = await MentorProfile.findOne({ mentorId: id });
    res.json({ success: true, data: buildMentorView(mentor, profile) });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentor profile' });
  }
};

// GET /api/mentors/:id/availability
export const getMentorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid mentor id' });
    const mentor = await User.findOne({ _id: id, role: 'mentor' });
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });
    const profile = await MentorProfile.findOne({ mentorId: id });
    const availability = profile?.availability?.length ? profile.availability : defaultAvailability();

    const booked = await MentorBooking.find({
      mentorId: id,
      status: { $in: BOOKABLE_STATUSES },
    });
    const bookedMap: Record<string, string[]> = {};
    booked.forEach((b) => {
      (bookedMap[b.date] = bookedMap[b.date] || []).push(b.time);
    });

    res.json({ success: true, data: { availability, booked: bookedMap } });
  } catch (error) {
    console.error('Error fetching mentor availability:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentor availability' });
  }
};

// POST /api/mentors/book
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { mentorId, startupId, topic, date, time, duration } = req.body;

    if (!mentorId || !startupId || !topic || !date || !time) {
      return res.status(400).json({ success: false, message: 'Mentor, startup, topic, date and time are required' });
    }
    if (!isValidId(mentorId) || !isValidId(startupId)) {
      return res.status(400).json({ success: false, message: 'Invalid mentor or startup id' });
    }

    const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });

    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

    // Prevent double booking of the same mentor + date + time slot
    const existing = await MentorBooking.findOne({
      mentorId,
      date,
      time,
      status: { $in: BOOKABLE_STATUSES },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Please select another slot.',
      });
    }

    const profile = await MentorProfile.findOne({ mentorId });
    const sessionDuration = Number(duration) || profile?.sessionDuration || 45;
    const sessionFee = profile?.sessionFee || 0;

    const booking = await MentorBooking.create({
      userId,
      mentorId,
      startupId,
      topic,
      date,
      time,
      duration: sessionDuration,
      status: 'pending',
      meetingLink: `https://meet.jit.si/ai-startup-builder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      paymentStatus: sessionFee > 0 ? 'unpaid' : 'not_required',
    });

    // Notify the mentor about the new session request
    try {
      const founder = await User.findById(userId);
      await NotificationModel.create({
        userId: mentorId.toString(),
        title: 'New Mentoring Session Request',
        message: `${founder?.fullName || 'A founder'} requested a session on ${date} at ${time} for "${startup.startupName}".`,
        type: 'mentor_booking',
        actionUrl: '/dashboard/mentor/sessions',
      });
    } catch (notifErr) {
      console.warn('Could not create booking notification:', (notifErr as Error).message);
    }

    const populated = await MentorBooking.findById(booking._id)
      .populate('mentorId', 'fullName expertise')
      .populate('startupId', 'startupName');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

// GET /api/mentors/bookings  (logged-in user's bookings)
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = { userId: req.user!.id };
    if (status) filter.status = status;
    const bookings = await MentorBooking.find(filter)
      .populate('mentorId', 'fullName expertise title')
      .populate('startupId', 'startupName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// GET /api/mentors/mentor/bookings  (bookings for the logged-in mentor)
export const getMentorBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = { mentorId: req.user!.id };
    if (status) filter.status = status;
    const bookings = await MentorBooking.find(filter)
      .populate('userId', 'fullName')
      .populate('startupId', 'startupName startupIdea aiGenerated')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching mentor bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mentor bookings' });
  }
};

// POST /api/mentors/bookings/:id/cancel
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id' });
    const booking = await MentorBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.userId.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
    }
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};

// POST /api/mentors/bookings/:id/reschedule
export const rescheduleBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id' });
    if (!date || !time) return res.status(400).json({ success: false, message: 'Date and time are required' });

    const booking = await MentorBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.userId.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
    }
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot reschedule a ${booking.status} booking` });
    }

    const conflicting = await MentorBooking.findOne({
      mentorId: booking.mentorId,
      date,
      time,
      status: { $in: BOOKABLE_STATUSES },
    });
    if (conflicting) {
      return res.status(409).json({ success: false, message: 'This time slot is no longer available. Please select another slot.' });
    }

    booking.date = date;
    booking.time = time;
    booking.status = 'rescheduled';
    await booking.save();
    res.json({ success: true, message: 'Booking rescheduled', data: booking });
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ success: false, message: 'Failed to reschedule booking' });
  }
};

// POST /api/mentors/bookings/:id/complete
export const completeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id' });
    const booking = await MentorBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isMentor = booking.mentorId.toString() === req.user!.id;
    const isOwner = booking.userId.toString() === req.user!.id;
    if (!isMentor && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this session' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot complete a cancelled booking' });
    }
    booking.status = 'completed';
    await booking.save();
    res.json({ success: true, message: 'Session completed', data: booking });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ success: false, message: 'Failed to complete session' });
  }
};

// POST /api/mentors/bookings/:id/feedback
export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback, recommendations, actionItems, improvementSuggestions, rating } = req.body;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id' });

    const booking = await MentorBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.mentorId.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned mentor can submit feedback' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted after the session is completed' });
    }
    const existing = await MentorFeedback.findOne({ bookingId: id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this session' });
    }

    const mentorFeedback = await MentorFeedback.create({
      bookingId: booking._id,
      mentorId: booking.mentorId,
      userId: booking.userId,
      startupId: booking.startupId,
      feedback: feedback || '',
      recommendations: recommendations || '',
      actionItems: actionItems || '',
      improvementSuggestions: improvementSuggestions || '',
      rating: Number(rating) || 0,
    });

    booking.feedbackGiven = true;
    await booking.save();

    // Store a summary against the startup idea so it stays linked to the startup
    try {
      const startup = await Startup.findById(booking.startupId);
      const mentor = await User.findById(booking.mentorId);
      if (startup) {
        startup.mentorFeedback = feedback || '';
        startup.mentorReview = {
          mentorId: booking.mentorId,
          mentorName: mentor?.fullName || '',
          rating: Number(rating) || 0,
          recommendations: recommendations || '',
          actionItems: actionItems || '',
          improvementSuggestions: improvementSuggestions || '',
          feedback: feedback || '',
          status: 'Pending',
          submittedAt: new Date().toISOString(),
        };
        await startup.save();
      }
    } catch (startupErr) {
      console.warn('Could not attach feedback to startup:', (startupErr as Error).message);
    }

    res.status(201).json({ success: true, data: mentorFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
};

// GET /api/mentors/bookings/:id/feedback
export const getBookingFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id' });
    const booking = await MentorBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isMentor = booking.mentorId.toString() === req.user!.id;
    const isOwner = booking.userId.toString() === req.user!.id;
    if (!isMentor && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this feedback' });
    }

    const feedback = await MentorFeedback.findOne({ bookingId: id });
    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
};
