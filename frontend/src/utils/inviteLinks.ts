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

export function getInvites(): MentorInvite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
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
