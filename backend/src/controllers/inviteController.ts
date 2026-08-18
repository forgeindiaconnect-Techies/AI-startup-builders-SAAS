import { Request, Response } from 'express';
import crypto from 'crypto';
import { MentorInvite, IMentorInvite } from '../models/Invite.js';
import { InvestorInvite } from '../models/InvestorInvite.js';
import { sendMentorInviteEmail } from '../utils/sendMentorInviteEmail.js';
import { sendInvestorInviteEmail, sendMeetingInviteEmail } from '../utils/emailService.js';

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
    const mentorInv = await MentorInvite.findOne({ inviteToken: token });

    if (mentorInv) {
      if (mentorInv.status === 'active' && mentorInv.expiresAt < new Date()) {
        mentorInv.status = 'expired';
        await mentorInv.save();
      }
      return res.json({ success: true, type: 'mentor', invite: toInviteJson(mentorInv) });
    }

    const investorInv = await InvestorInvite.findOne({ invitationToken: token });
    if (investorInv) {
      return res.json({
        success: true,
        type: 'investor',
        invite: {
          id: investorInv._id.toString(),
          fullName: investorInv.fullName,
          email: investorInv.email,
          phone: investorInv.phone,
          companyName: investorInv.companyName,
          designation: investorInv.designation,
          investorType: investorInv.investorType,
          linkedinUrl: investorInv.linkedinUrl,
          website: investorInv.website,
          location: investorInv.location,
          interestedIndustries: investorInv.interestedIndustries,
          investmentStage: investorInv.investmentStage,
          investmentRange: investorInv.investmentRange,
          adminNotes: investorInv.adminNotes,
          invitationToken: investorInv.invitationToken,
          inviteUrl: investorInv.inviteUrl,
          status: investorInv.status,
          createdAt: investorInv.createdAt ? investorInv.createdAt.toISOString() : new Date().toISOString(),
          expiryDate: investorInv.expiresAt ? investorInv.expiresAt.toISOString() : '',
        }
      });
    }

    return res.status(404).json({ success: false, error: 'not_found' });
  } catch (error: any) {
    console.error('Get invite failed:', error);
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
    let invite = await MentorInvite.findOneAndDelete({ inviteToken: token });
    if (!invite) {
      await InvestorInvite.findOneAndDelete({ invitationToken: token });
    }
    return res.json({ success: true, message: 'Invite deleted' });
  } catch (error: any) {
    console.error('Delete invite failed:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete invite' });
  }
};

export const listInvites = async (_req: Request, res: Response) => {
  try {
    const mentorInvites = await MentorInvite.find().sort({ createdAt: -1 });
    const investorInvites = await InvestorInvite.find().sort({ createdAt: -1 });

    const formattedInvestorInvites = investorInvites.map(inv => ({
      id: inv._id.toString(),
      fullName: inv.fullName,
      email: inv.email,
      phone: inv.phone,
      companyName: inv.companyName,
      designation: inv.designation,
      investorType: inv.investorType,
      linkedinUrl: inv.linkedinUrl,
      website: inv.website,
      location: inv.location,
      interestedIndustries: inv.interestedIndustries,
      investmentStage: inv.investmentStage,
      investmentRange: inv.investmentRange,
      adminNotes: inv.adminNotes,
      invitationToken: inv.invitationToken,
      inviteUrl: inv.inviteUrl,
      status: inv.status,
      createdAt: inv.createdAt ? inv.createdAt.toISOString() : new Date().toISOString(),
      expiryDate: inv.expiresAt ? inv.expiresAt.toISOString() : '',
    }));

    return res.json({
      success: true,
      invites: mentorInvites.map(toInviteJson),
      investorInvites: formattedInvestorInvites,
    });
  } catch (error: any) {
    console.error('List invites failed:', error);
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
    const queryParts = [
      `invitationToken=${invitationToken}`,
      `fullName=${encodeURIComponent(fullName)}`,
      `email=${encodeURIComponent(email)}`,
      `linkedinUrl=${encodeURIComponent(linkedin)}`,
      `phone=${encodeURIComponent(phone || '')}`,
      `companyName=${encodeURIComponent(companyName || '')}`,
      `designation=${encodeURIComponent(designation || '')}`,
      `investorType=${encodeURIComponent(investorType || 'Angel Investor')}`,
      `location=${encodeURIComponent(location || '')}`,
      `website=${encodeURIComponent(website || '')}`,
      `investmentRange=${encodeURIComponent(investmentRange || '')}`,
    ];
    if (Array.isArray(interestedIndustries) && interestedIndustries.length > 0) {
      queryParts.push(`interestedIndustries=${encodeURIComponent(interestedIndustries.join(','))}`);
    }
    if (Array.isArray(investmentStage) && investmentStage.length > 0) {
      queryParts.push(`investmentStage=${encodeURIComponent(investmentStage.join(','))}`);
    }

    const relativeUrl = `/investor-signup?${queryParts.join('&')}`;
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

export const sendMeetingInvite = async (req: Request, res: Response) => {
  try {
    const { email, fullName, meetingDate, meetingTime, videoUrl, passcode } = req.body;

    if (!email || !fullName || !meetingDate || !meetingTime || !videoUrl || !passcode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for meeting invite email'
      });
    }

    const emailSent = await sendMeetingInviteEmail({
      to: email.toLowerCase().trim(),
      fullName,
      meetingDate,
      meetingTime,
      videoUrl,
      passcode
    });

    return res.json({
      success: emailSent,
      message: emailSent
        ? 'Meeting invite email sent via Brevo successfully!'
        : 'Failed to send meeting invite email via Brevo.'
    });
  } catch (error: any) {
    console.error('Send meeting invite controller error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};
