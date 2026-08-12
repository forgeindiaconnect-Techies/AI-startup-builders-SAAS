import { Request, Response } from 'express';
import crypto from 'crypto';
import { MentorInvite, IMentorInvite } from '../models/Invite.js';
import { InvestorInvite } from '../models/InvestorInvite.js';
import { sendMentorInviteEmail } from '../utils/sendMentorInviteEmail.js';
import { sendInvestorInviteEmail } from '../utils/emailService.js';

const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const getBaseOrigin = (req: Request): string => {
  const origin = req.headers.origin || req.get('referer') || process.env.APP_URL || 'http://localhost:5173';
  return origin.replace(/\/$/, '');
};

const toInviteJson = (inv: IMentorInvite) => ({
  id: inv._id.toString(),
  mentorName: inv.mentorName,
  mentorEmail: inv.mentorEmail,
  expertise: inv.expertise,
  inviteToken: inv.inviteToken,
  inviteUrl: inv.inviteUrl,
  status: inv.status,
  message: inv.message,
  createdAt: inv.createdAt?.toISOString() || new Date().toISOString(),
  expiresAt: inv.expiresAt?.toISOString() || '',
  expiryDate: inv.expiresAt?.toISOString() || '',
  usedAt: inv.usedAt?.toISOString() || '',
  emailedAt: inv.emailedAt?.toISOString() || '',
});

export const createMentorInvite = async (req: Request, res: Response) => {
  try {
    const { mentorName, mentorEmail, expertise, message, inviteLink, expiryDate } = req.body;

    if (!mentorName || !mentorEmail) {
      return res.status(400).json({
        success: false,
        error: 'Mentor name and email are required',
      });
    }

    const inviteToken = crypto.randomBytes(24).toString('hex');
    const inviteUrl = `/signup?role=mentor&inviteToken=${inviteToken}`;
    const fullLink = inviteLink || `${getBaseOrigin(req)}${inviteUrl}`;
    const expiresAt = expiryDate
      ? new Date(expiryDate)
      : new Date(Date.now() + DEFAULT_EXPIRY_MS);

    const invite = await MentorInvite.create({
      mentorName,
      mentorEmail,
      expertise: expertise || '',
      inviteToken,
      inviteUrl,
      message: message || '',
      expiresAt,
      emailedAt: new Date(),
    });

    let emailSent = true;
    let emailError = '';
    try {
      await sendMentorInviteEmail({
        mentorName,
        mentorEmail,
        inviteLink: fullLink,
        message: message || '',
        expertise: expertise || '',
        expiresAt,
      });
    } catch (e: any) {
      emailSent = false;
      emailError = e.message || 'Email send failed';
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? 'Mentor invite created and email sent successfully'
        : 'Mentor invite created, but the email could not be sent',
      emailSent,
      emailError,
      invite: toInviteJson(invite),
    });
  } catch (error: any) {
    console.error('Create mentor invite failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create mentor invite',
    });
  }
};

export const getInviteByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const invite = await MentorInvite.findOne({ inviteToken: token });

    if (!invite) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }

    if (invite.status === 'active' && invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
    }

    return res.json({ success: true, invite: toInviteJson(invite) });
  } catch (error: any) {
    console.error('Get mentor invite failed:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const resendInvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const invite = await MentorInvite.findOne({ inviteToken: token });

    if (!invite) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }
    if (invite.status === 'disabled') {
      return res.status(400).json({ success: false, error: 'disabled' });
    }

    const fullLink = req.body.inviteLink || `${getBaseOrigin(req)}${invite.inviteUrl}`;

    let emailSent = true;
    let emailError = '';
    try {
      await sendMentorInviteEmail({
        mentorName: invite.mentorName,
        mentorEmail: invite.mentorEmail,
        inviteLink: fullLink,
        message: invite.message,
        expertise: invite.expertise,
        expiresAt: invite.expiresAt,
      });
    } catch (e: any) {
      emailSent = false;
      emailError = e.message || 'Email send failed';
    }

    invite.emailedAt = new Date();
    await invite.save();

    return res.json({
      success: true,
      message: emailSent
        ? 'Invite email resent successfully'
        : 'Invite email could not be sent',
      emailSent,
      emailError,
      invite: toInviteJson(invite),
    });
  } catch (error: any) {
    console.error('Resend mentor invite failed:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const markInviteUsed = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const invite = await MentorInvite.findOne({ inviteToken: token });

    if (!invite) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }

    invite.status = 'used';
    invite.usedAt = new Date();
    await invite.save();

    return res.json({ success: true, invite: toInviteJson(invite) });
  } catch (error: any) {
    console.error('Mark mentor invite used failed:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateInvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { mentorName, mentorEmail, expertise, message, expiryDate, status } = req.body;

    const invite = await MentorInvite.findOne({ inviteToken: token });

    if (!invite) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }

    if (mentorName !== undefined) invite.mentorName = mentorName;
    if (mentorEmail !== undefined) invite.mentorEmail = mentorEmail;
    if (expertise !== undefined) invite.expertise = expertise;
    if (message !== undefined) invite.message = message;
    if (expiryDate !== undefined) invite.expiresAt = new Date(expiryDate);
    if (status !== undefined && ['active', 'used', 'expired', 'disabled'].includes(status)) {
      invite.status = status;
    }

    await invite.save();

    return res.json({ success: true, invite: toInviteJson(invite) });
  } catch (error: any) {
    console.error('Update mentor invite failed:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update mentor invite' });
  }
};

export const deleteInvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const invite = await MentorInvite.findOneAndDelete({ inviteToken: token });

    if (!invite) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }

    return res.json({ success: true, message: 'Invite deleted' });
  } catch (error: any) {
    console.error('Delete mentor invite failed:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete mentor invite' });
  }
};

export const listInvites = async (_req: Request, res: Response) => {
  try {
    const invites = await MentorInvite.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      invites: invites.map(toInviteJson),
    });
  } catch (error: any) {
    console.error('List mentor invites failed:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createInvestorInvite = async (req: Request, res: Response) => {
  try {
    const {
      fullName, email, phone, companyName, designation,
      investorType, linkedinUrl, website, location,
      interestedIndustries, investmentStage, investmentRange, adminNotes
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Full Name and Email Address are required'
      });
    }

    const linkedin = linkedinUrl || '';
    const invitationToken = `inv_tok_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const relativeUrl = `/investor-signup?invitationToken=${invitationToken}&fullName=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&linkedinUrl=${encodeURIComponent(linkedin)}`;
    const fullInviteUrl = `${getBaseOrigin(req)}${relativeUrl}`;
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const invite = await InvestorInvite.create({
      fullName,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      companyName: companyName || '',
      designation: designation || '',
      investorType: investorType || 'Angel Investor',
      linkedinUrl,
      website: website || '',
      location: location || '',
      interestedIndustries: interestedIndustries || [],
      investmentStage: investmentStage || [],
      investmentRange: investmentRange || '',
      adminNotes: adminNotes || '',
      invitationToken,
      inviteUrl: fullInviteUrl,
      status: 'INVITED',
      expiresAt,
    });

    let emailSent = false;
    let emailError = '';
    try {
      emailSent = await sendInvestorInviteEmail(
        email.toLowerCase().trim(),
        fullName,
        fullInviteUrl,
        adminNotes
      );
    } catch (e: any) {
      emailSent = false;
      emailError = e.message || 'Email sending failed';
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? 'Investor invitation created and email notification sent successfully!'
        : 'Investor invitation created locally, but email delivery failed.',
      emailSent,
      emailError,
      invite: {
        id: invite._id.toString(),
        fullName: invite.fullName,
        email: invite.email,
        phone: invite.phone,
        companyName: invite.companyName,
        designation: invite.designation,
        investorType: invite.investorType,
        linkedinUrl: invite.linkedinUrl,
        website: invite.website,
        location: invite.location,
        interestedIndustries: invite.interestedIndustries,
        investmentStage: invite.investmentStage,
        investmentRange: invite.investmentRange,
        adminNotes: invite.adminNotes,
        invitationToken: invite.invitationToken,
        inviteUrl: invite.inviteUrl,
        status: invite.status,
        createdAt: invite.createdAt.toISOString(),
        expiryDate: invite.expiresAt.toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Create investor invite error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create investor invitation'
    });
  }
};
