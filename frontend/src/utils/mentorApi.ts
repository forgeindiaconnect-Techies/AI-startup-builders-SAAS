import { API_URL } from '../config/api';

const TOKEN_KEY = 'ai_startup_builder_jwt';

const authHeaders = (json: boolean): Record<string, string> => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  return data;
};

// GET /api/mentors
export const getMentors = async (): Promise<any[]> => {
  const res = await fetch(`${API_URL}/mentors`, { headers: authHeaders(false) });
  const data = await handleResponse(res);
  return data.data || [];
};

// GET /api/mentors/:id
export const getMentorProfile = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/${id}`, { headers: authHeaders(false) });
  const data = await handleResponse(res);
  return data.data;
};

// PUT /api/mentors/admin/:id  (admin edits mentor profile + session fee)
export const updateMentorProfileAdmin = async (
  id: string,
  payload: {
    fullName?: string;
    title?: string;
    expertise?: string;
    industry?: string;
    categories?: string;
    bio?: string;
    experienceYears?: number;
    linkedin?: string;
    photoUrl?: string;
    location?: string;
    sessionDuration?: number;
    sessionFee?: number;
    isActive?: boolean;
    status?: string;
    approvalStatus?: string;
    availableDays?: number[];
    availableSlots?: string[];
  }
): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/admin/${id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

// GET /api/mentors/:id/availability
export const getMentorAvailability = async (id: string): Promise<{ availability: any[]; booked: Record<string, string[]> }> => {
  const res = await fetch(`${API_URL}/mentors/${id}/availability`, { headers: authHeaders(false) });
  const data = await handleResponse(res);
  return data.data;
};

// POST /api/mentors/book
export const createMentorBooking = async (payload: {
  mentorId: string;
  startupId: string;
  topic: string;
  date?: string;
  time?: string;
  duration?: number;
}): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/book`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

// GET /api/mentors/bookings
export const getMyBookings = async (status?: string): Promise<any[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_URL}/mentors/bookings${query}`, { headers: authHeaders(false) });
  const data = await handleResponse(res);
  return data.data || [];
};

// GET /api/mentors/mentor/bookings  (bookings for the logged-in mentor)
export const getMentorBookings = async (status?: string): Promise<any[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_URL}/mentors/mentor/bookings${query}`, { headers: authHeaders(false) });
  const data = await handleResponse(res);
  return data.data || [];
};

// POST /api/mentors/bookings/:id/cancel
export const cancelBooking = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/bookings/${id}/cancel`, {
    method: 'POST',
    headers: authHeaders(true),
  });
  return handleResponse(res);
};

// POST /api/mentors/bookings/:id/reschedule
export const rescheduleBooking = async (id: string, payload: { date: string; time: string }): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/bookings/${id}/reschedule`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// POST /api/mentors/bookings/:id/complete
export const completeSession = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/bookings/${id}/complete`, {
    method: 'POST',
    headers: authHeaders(true),
  });
  return handleResponse(res);
};

// POST /api/mentors/bookings/:id/schedule  (mentor fixes time, slot and days)
export const scheduleMentorSession = async (
  id: string,
  payload: { date: string; time: string; duration?: number; meetingLink?: string }
): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/bookings/${id}/schedule`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

// POST /api/mentors/bookings/:id/accept  (founder accepts the scheduled session after UPI payment)
export const acceptMentorSession = async (
  id: string,
  payment?: { paymentMethod?: string; transactionId?: string }
): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/bookings/${id}/accept`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payment || {}),
  });
  const data = await handleResponse(res);
  return data.data;
};

// POST /api/mentors/bookings/:id/feedback
export const submitMentorFeedback = async (
  id: string,
  payload: {
    feedback: string;
    recommendations?: string;
    actionItems?: string;
    improvementSuggestions?: string;
    rating?: number;
  }
): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/bookings/${id}/feedback`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

// GET /api/mentors/bookings/:id/feedback
export const getBookingFeedback = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/mentors/bookings/${id}/feedback`, { headers: authHeaders(false) });
  const data = await handleResponse(res);
  return data.data;
};
