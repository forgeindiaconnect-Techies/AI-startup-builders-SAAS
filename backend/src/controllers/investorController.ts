import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { InvestorInvite } from '../models/InvestorInvite.js';

// Fetch approved investors with BASIC details only (no sensitive documents)
export const getApprovedInvestors = async (_req: Request, res: Response) => {
  try {
    // 1. Fetch approved investors from User collection
    const approvedUsers = await User.find({
      role: 'investor',
      approvalStatus: 'approved',
      status: { $ne: 'suspended' },
    }).lean();

    // 2. Fetch accepted/invited investor leads
    const acceptedInvites = await InvestorInvite.find({
      status: { $in: ['ACCEPTED', 'INVITED'] },
    }).lean();

    const processedEmails = new Set<string>();
    const approvedList: any[] = [];

    approvedUsers.forEach((u: any) => {
      const emailKey = (u.email || '').trim().toLowerCase();
      if (emailKey) processedEmails.add(emailKey);

      approvedList.push({
        id: u._id.toString(),
        name: u.fullName || u.name || 'Approved Investor',
        email: u.email,
        companyName: u.companyName || u.organization || 'Independent Investor',
        designation: u.designation || 'Angel Investor',
        investorType: u.investorType || u.investorCategory || 'Angel Investor',
        experienceYears: u.previousExperience || u.experienceYears || '5+ years',
        location: u.location || u.preferredLocation || 'India',
        linkedinUrl: u.linkedin || u.linkedinUrl || '',
        website: u.website || '',
        bio: u.bio || u.adminNotes || 'Active investor supporting high-growth startups.',
        preferredIndustries: Array.isArray(u.preferredIndustries) && u.preferredIndustries.length > 0
          ? u.preferredIndustries
          : u.preferredIndustry ? [u.preferredIndustry] : ['Artificial Intelligence', 'SaaS', 'FinTech'],
        investmentStages: Array.isArray(u.investmentStages) && u.investmentStages.length > 0
          ? u.investmentStages
          : ['Seed', 'Series A'],
        investmentRange: u.investmentRange || '₹25 Lakhs – ₹1 Crore',
        investmentFocus: u.investmentFocus || u.investmentThesis || 'Proprietary technology stack, strong market potential, and committed founders.',
        portfolioCompanies: u.portfolioCompanies || '',
        notableInvestments: u.notableInvestments || '',
        areasOfExpertise: u.areasOfExpertise || '',
        verificationStatus: 'APPROVED',
        avatar: u.fullName ? u.fullName.charAt(0).toUpperCase() : 'I',
      });
    });

    acceptedInvites.forEach((inv: any) => {
      const emailKey = (inv.email || '').trim().toLowerCase();
      if (emailKey && !processedEmails.has(emailKey)) {
        processedEmails.add(emailKey);
        approvedList.push({
          id: inv._id.toString(),
          name: inv.fullName,
          email: inv.email,
          companyName: inv.companyName || 'Angel Network',
          designation: inv.designation || 'Angel Investor',
          investorType: inv.investorType || 'Angel Investor',
          experienceYears: inv.experienceYears || '5+ years',
          location: inv.location || 'India',
          linkedinUrl: inv.linkedinUrl || '',
          website: inv.website || '',
          bio: inv.adminNotes || 'Active investor supporting high-growth startups.',
          preferredIndustries: Array.isArray(inv.interestedIndustries) && inv.interestedIndustries.length > 0
            ? inv.interestedIndustries
            : ['Artificial Intelligence', 'SaaS', 'FinTech'],
          investmentStages: Array.isArray(inv.investmentStage) && inv.investmentStage.length > 0
            ? inv.investmentStage
            : ['Seed'],
          investmentRange: inv.investmentRange || '₹25 Lakhs – ₹1 Crore',
          investmentFocus: 'Early revenue traction and clean cap tables.',
          portfolioCompanies: inv.portfolioCompanies || '',
          notableInvestments: '',
          areasOfExpertise: '',
          verificationStatus: 'APPROVED',
          avatar: inv.fullName ? inv.fullName.charAt(0).toUpperCase() : 'I',
        });
      }
    });

    return res.status(200).json({
      success: true,
      count: approvedList.length,
      investors: approvedList,
    });
  } catch (error: any) {
    console.error('Error fetching approved investors:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve investors.' });
  }
};
