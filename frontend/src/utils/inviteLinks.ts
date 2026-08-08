const STORAGE_KEY = 'ai_startup_builder_mentor_invites';

export interface MentorInvite {
  id: string;
  mentorName: string;
  mentorEmail: string;
  expertise: string;
  inviteToken: string;
  inviteUrl: string;
  status: 'active' | 'used' | 'expired' | 'disabled';
  createdAt: string;
  expiryDate: string;
  message?: string;
  usedAt?: string;
}

export const INITIAL_DEMO_INVITES: MentorInvite[] = [
  {
    id: 'inv_demo_1',
    mentorName: 'Mano',
    mentorEmail: 'mano@techstart.io',
    expertise: 'Venture Capital, Scaling, SaaS',
    inviteToken: 'd6a782b19e402c81729b40fa',
    inviteUrl: '/signup?role=mentor&inviteToken=d6a782b19e402c81729b40fa',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Welcome to AI Startup Builder as an official Mentor!',
  },
  {
    id: 'inv_demo_2',
    mentorName: 'Dr. Aris Thorne',
    mentorEmail: 'aris.thorne@deeptech.org',
    expertise: 'AI/ML, Product Strategy',
    inviteToken: 'f81029c781034ab812903fe',
    inviteUrl: '/signup?role=mentor&inviteToken=f81029c781034ab812903fe',
    status: 'used',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    usedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Exclusive invitation to mentor our AI cohort.',
  },
  {
    id: 'inv_demo_3',
    mentorName: 'Sarah Chen',
    mentorEmail: 'sarah.chen@growthvc.com',
    expertise: 'Marketing & Growth, Fundraising',
    inviteToken: 'c7193b281094056ac81290a',
    inviteUrl: '/signup?role=mentor&inviteToken=c7193b281094056ac81290a',
    status: 'active',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Join our elite network of startup mentors.',
  },
  {
    id: 'inv_demo_4',
    mentorName: 'Rajesh Kumar',
    mentorEmail: 'rajesh@scaleup.in',
    expertise: 'Fintech, Compliance & Operations',
    inviteToken: 'a12904b71938102958cd10b',
    inviteUrl: '/signup?role=mentor&inviteToken=a12904b71938102958cd10b',
    status: 'expired',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Invitation to review seed-stage startups.',
  },
];

export function getInvites(): MentorInvite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_INVITES));
      return INITIAL_DEMO_INVITES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_INVITES));
      return INITIAL_DEMO_INVITES;
    }
    return parsed;
  } catch {
    return INITIAL_DEMO_INVITES;
  }
}

function saveInvites(invites: MentorInvite[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
}

export function createInvite(data: {
  mentorName: string;
  mentorEmail: string;
  expertise: string;
  expiryDate: string;
  message?: string;
}): MentorInvite {
  const invites = getInvites();
  const inviteToken = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
  const invite: MentorInvite = {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    mentorName: data.mentorName,
    mentorEmail: data.mentorEmail,
    expertise: data.expertise,
    inviteToken,
    inviteUrl: `/signup?role=mentor&inviteToken=${inviteToken}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiryDate: new Date(data.expiryDate).toISOString(),
    message: data.message || '',
  };
  invites.unshift(invite);
  saveInvites(invites);
  return invite;
}

export function getInviteByToken(token: string): MentorInvite | undefined {
  return getInvites().find((inv) => inv.inviteToken === token);
}

export function storeInvite(invite: Partial<MentorInvite> & { inviteToken: string }): MentorInvite {
  const invites = getInvites();
  const existingIdx = invites.findIndex((inv) => inv.inviteToken === invite.inviteToken);
  const full: MentorInvite = {
    id: invite.id || `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    mentorName: invite.mentorName || '',
    mentorEmail: invite.mentorEmail || '',
    expertise: invite.expertise || '',
    inviteToken: invite.inviteToken,
    inviteUrl: invite.inviteUrl || `/signup?role=mentor&inviteToken=${invite.inviteToken}`,
    status: (invite.status as MentorInvite['status']) || 'active',
    createdAt: invite.createdAt || new Date().toISOString(),
    expiryDate: invite.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: invite.message || '',
    usedAt: invite.usedAt,
  };
  if (existingIdx !== -1) {
    invites[existingIdx] = full;
  } else {
    invites.unshift(full);
  }
  saveInvites(invites);
  return full;
}

export function validateInvite(token: string): { valid: boolean; reason?: string } {
  const invite = getInviteByToken(token);
  if (!invite) return { valid: false, reason: 'not_found' };
  if (invite.status === 'used') return { valid: false, reason: 'used' };
  if (invite.status === 'disabled') return { valid: false, reason: 'disabled' };
  if (invite.status === 'expired') return { valid: false, reason: 'expired' };
  if (new Date(invite.expiryDate) < new Date()) {
    invite.status = 'expired';
    updateInviteField(token, 'status', 'expired');
    return { valid: false, reason: 'expired' };
  }
  return { valid: true };
}

export function markInviteUsed(token: string): void {
  const invites = getInvites();
  const idx = invites.findIndex((inv) => inv.inviteToken === token);
  if (idx !== -1) {
    invites[idx].status = 'used';
    invites[idx].usedAt = new Date().toISOString();
    saveInvites(invites);
  }
}

function updateInviteField(token: string, field: keyof MentorInvite, value: any): void {
  const invites = getInvites();
  const idx = invites.findIndex((inv) => inv.inviteToken === token);
  if (idx !== -1) {
    (invites[idx] as any)[field] = value;
    saveInvites(invites);
  }
}

export function updateInvite(token: string, updates: Partial<MentorInvite>): void {
  const invites = getInvites();
  const idx = invites.findIndex((inv) => inv.inviteToken === token);
  if (idx !== -1) {
    invites[idx] = { ...invites[idx], ...updates };
    saveInvites(invites);
  }
}

export function deleteInvite(token: string): void {
  const invites = getInvites().filter((inv) => inv.inviteToken !== token);
  saveInvites(invites);
}

export function disableInvite(token: string): void {
  updateInviteField(token, 'status', 'disabled');
}

export function resendInvite(token: string): void {
  updateInviteField(token, 'createdAt', new Date().toISOString());
}
