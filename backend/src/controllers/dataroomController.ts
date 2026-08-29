import { Request, Response } from 'express';
import DataRoom from '../models/DataRoom.js';
import Startup from '../models/Startup.js';
import { User } from '../models/User.js';

// Get Data Room by Startup ID (or create initial standard categories if none exists)
export const getDataRoomByStartup = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    let room = await DataRoom.findOne({ startupId });

    if (!room) {
      const startup = await Startup.findById(startupId);
      if (!startup) {
        return res.status(404).json({ success: false, message: 'Startup not found' });
      }

      // Seed initial sample categories structure for startup
      room = await DataRoom.create({
        startupId: startup._id.toString(),
        startupName: startup.startupName || 'Startup Pitch',
        founderId: startup.founderId ? startup.founderId.toString() : 'anonymous',
        founderName: 'Founder',
        startupStage: 'Seed',
        dealStage: 'Due Diligence',
        status: 'Active',
        documents: [
          {
            name: 'Certificate of Incorporation',
            category: 'company_legal',
            description: 'Official company registration certificate',
            fileUrl: '/uploads/sample_inc.pdf',
            fileType: 'pdf',
            fileSize: '1.4 MB',
            uploadedBy: 'founder',
            version: 1,
            status: 'Required',
            permission: 'View Only',
            stageRequirement: 'Seed',
            uploadedAt: new Date(),
          },
          {
            name: 'Investor Pitch Deck 2026',
            category: 'business_startup',
            description: '12-slide comprehensive pitch deck',
            fileUrl: '/uploads/pitch_deck_v2.pdf',
            fileType: 'pdf',
            fileSize: '3.8 MB',
            uploadedBy: 'founder',
            version: 1,
            status: 'Required',
            permission: 'View + Download',
            stageRequirement: 'Seed',
            uploadedAt: new Date(),
          },
          {
            name: '3-Year Financial Projections & Cashflow',
            category: 'financial_info',
            description: 'Detailed revenue & expense model with unit economics',
            fileUrl: '/uploads/financial_model_2026.xlsx',
            fileType: 'xlsx',
            fileSize: '2.1 MB',
            uploadedBy: 'founder',
            version: 1,
            status: 'Required',
            permission: 'View Only',
            stageRequirement: 'Seed',
            uploadedAt: new Date(),
          },
          {
            name: 'Market Research & TAM/SAM/SOM Analysis',
            category: 'market_customer',
            description: 'Industry growth stats and competitor benchmarks',
            fileUrl: '/uploads/market_analysis.pdf',
            fileType: 'pdf',
            fileSize: '2.5 MB',
            uploadedBy: 'founder',
            version: 1,
            status: 'Recommended',
            permission: 'View + Download',
            stageRequirement: 'Seed',
            uploadedAt: new Date(),
          },
          {
            name: 'System Architecture & Security Audit',
            category: 'product_tech',
            description: 'Cloud architecture overview and data protection compliance',
            fileUrl: '/uploads/tech_arch.pdf',
            fileType: 'pdf',
            fileSize: '1.8 MB',
            uploadedBy: 'founder',
            version: 1,
            status: 'Recommended',
            permission: 'View Only',
            stageRequirement: 'Seed',
            uploadedAt: new Date(),
          },
        ],
        investorAccess: [],
        questions: [],
        auditLogs: [
          {
            userId: startup.founderId ? startup.founderId.toString() : 'system',
            userName: 'System',
            userRole: 'founder',
            action: 'Data Room Initialized',
            details: 'Created initial investor due diligence data room.',
            timestamp: new Date(),
          },
        ],
        aiAnalysis: {
          overallReadiness: 78,
          businessScore: 'Strong',
          marketScore: 'High potential',
          financialsScore: 'Requires additional information',
          techScore: 'Moderate risk',
          legalScore: 'Documents pending',
          riskIndicators: [
            'Cap table requires clarification on unallocated ESOP pool',
            'Pending audited tax clearance for FY2025',
          ],
          missingDocuments: [
            'Audited Balance Sheet FY25',
            'Customer LOI Agreements',
            'IP Trademark Registration Certificate',
          ],
          inconsistencies: [
            'Financial model revenue growth exceeds market research TAM expansion rates by 12%',
          ],
          keyQuestionsForInvestor: [
            'What is the projected CAC payback period across enterprise contracts?',
            'What regulatory licenses are required for cross-border expansion?',
          ],
          keyQuestionsForFounder: [
            'Can you explain the breakdown of recurring SaaS vs custom deployment revenue?',
            'When do you plan to complete your pending IP patent filings?',
          ],
          checklist: [
            { title: 'Company Registration & Incorporation', status: 'Complete' },
            { title: 'Pitch Deck & Business Model', status: 'Complete' },
            { title: 'Financial Projections & Valuation', status: 'Pending' },
            { title: 'Cap Table & Founder Equity', status: 'Pending' },
            { title: 'Audited Tax & Regulatory Approvals', status: 'Missing' },
          ],
          redFlags: [
            'Single enterprise customer accounts for 65% of current ARR',
          ],
          growthOpportunities: [
            'High retention rate (94%) among early pilot beta users',
            'Proprietary ML pipeline lowers API inferencing costs by 40%',
          ],
          analyzedAt: new Date(),
        },
      });
    }

    return res.json({ success: true, data: room });
  } catch (err: any) {
    console.error('Error fetching data room:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Get Data Rooms Accessible to an Investor
export const getInvestorDataRooms = async (req: Request, res: Response) => {
  try {
    const { investorId } = req.query;

    if (!investorId) {
      return res.status(400).json({ success: false, message: 'investorId is required' });
    }

    // Find rooms where investorAccess has investorId with status 'granted'
    const rooms = await DataRoom.find({
      'investorAccess': {
        $elemMatch: {
          investorId: String(investorId),
          status: 'granted',
        },
      },
    });

    return res.json({ success: true, data: rooms });
  } catch (err: any) {
    console.error('Error fetching investor data rooms:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Upload or add a document to Data Room
export const addDocument = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const { name, category, description, fileUrl, fileType, fileSize, status, permission, stageRequirement, uploadedBy, uploaderName } = req.body;

    const room = await DataRoom.findOne({ startupId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Data room not found' });
    }

    const newDoc = {
      name,
      category,
      description: description || '',
      fileUrl: fileUrl || '/uploads/sample_doc.pdf',
      fileType: fileType || 'pdf',
      fileSize: fileSize || '1.5 MB',
      uploadedBy: uploadedBy || room.founderId,
      uploaderName: uploaderName || room.founderName,
      version: 1,
      status: status || 'Recommended',
      permission: permission || 'View Only',
      stageRequirement: stageRequirement || 'Seed',
      uploadedAt: new Date(),
      updatedAt: new Date(),
    };

    room.documents.push(newDoc as any);

    // Audit log
    room.auditLogs.push({
      userId: uploadedBy || room.founderId,
      userName: uploaderName || 'Founder',
      userRole: 'founder',
      action: 'Document Uploaded',
      documentName: name,
      details: `Added new document in ${category} category with ${permission} permissions.`,
      timestamp: new Date(),
    });

    await room.save();
    return res.json({ success: true, data: room });
  } catch (err: any) {
    console.error('Error adding document:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Update Document Permission or Status or Replace Version
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { startupId, docId } = req.params;
    const { permission, status, replaceFileUrl, replaceFileSize, userRole, userName, userId } = req.body;

    const room = await DataRoom.findOne({ startupId });
    if (!room) return res.status(404).json({ success: false, message: 'Data room not found' });

    const docIndex = room.documents.findIndex((d) => d._id?.toString() === docId || (d as any).id === docId);
    if (docIndex === -1) return res.status(404).json({ success: false, message: 'Document not found' });

    const targetDoc = room.documents[docIndex];

    if (replaceFileUrl) {
      // Archive current version to previousVersions
      if (!targetDoc.previousVersions) targetDoc.previousVersions = [] as any;
      targetDoc.previousVersions.push({
        version: targetDoc.version,
        fileUrl: targetDoc.fileUrl,
        fileSize: targetDoc.fileSize,
        uploadedAt: targetDoc.updatedAt || new Date(),
        replacedBy: userName || 'Founder',
      });

      targetDoc.version = targetDoc.version + 1;
      targetDoc.fileUrl = replaceFileUrl;
      if (replaceFileSize) targetDoc.fileSize = replaceFileSize;
      targetDoc.updatedAt = new Date();

      room.auditLogs.push({
        userId: userId || room.founderId,
        userName: userName || 'Founder',
        userRole: (userRole as any) || 'founder',
        action: 'Document Version Replaced',
        documentId: docId,
        documentName: targetDoc.name,
        details: `Updated to Version ${targetDoc.version}`,
        timestamp: new Date(),
      });
    }

    if (permission) {
      targetDoc.permission = permission;
      room.auditLogs.push({
        userId: userId || room.founderId,
        userName: userName || 'Founder',
        userRole: (userRole as any) || 'founder',
        action: 'Permission Updated',
        documentId: docId,
        documentName: targetDoc.name,
        details: `Permission changed to ${permission}`,
        timestamp: new Date(),
      });
    }

    if (status) {
      targetDoc.status = status;
    }

    await room.save();
    return res.json({ success: true, data: room });
  } catch (err: any) {
    console.error('Error updating document:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Grant or Revoke Investor Access
export const manageInvestorAccess = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const { investorId, investorName, investorEmail, action, permissionLevel, performedBy, performedByName } = req.body;

    const room = await DataRoom.findOne({ startupId });
    if (!room) return res.status(404).json({ success: false, message: 'Data room not found' });

    let accessObj = room.investorAccess.find((a) => a.investorId === String(investorId));

    if (action === 'grant') {
      if (!accessObj) {
        room.investorAccess.push({
          investorId: String(investorId),
          investorName: investorName || 'Investor',
          investorEmail: investorEmail || '',
          status: 'granted',
          grantedAt: new Date(),
          grantedBy: performedByName || 'Founder',
          permissionLevel: permissionLevel || 'View Only',
        });
      } else {
        accessObj.status = 'granted';
        accessObj.grantedAt = new Date();
        if (permissionLevel) accessObj.permissionLevel = permissionLevel;
      }

      room.auditLogs.push({
        userId: performedBy || room.founderId,
        userName: performedByName || 'Founder',
        userRole: 'founder',
        action: 'Access Granted',
        details: `Granted data room access to ${investorName} (${investorEmail || 'Investor'}).`,
        timestamp: new Date(),
      });
    } else if (action === 'revoke') {
      if (accessObj) {
        accessObj.status = 'revoked';
      }

      room.auditLogs.push({
        userId: performedBy || room.founderId,
        userName: performedByName || 'Founder',
        userRole: 'founder',
        action: 'Access Revoked',
        details: `Revoked data room access for ${investorName || investorId}.`,
        timestamp: new Date(),
      });
    }

    await room.save();
    return res.json({ success: true, data: room });
  } catch (err: any) {
    console.error('Error managing investor access:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Submit Investor Question or Founder Answer
export const addQuestionOrAnswer = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const { documentId, documentName, investorId, investorName, investorEmail, question, questionId, answer, userId, userName, userRole } = req.body;

    const room = await DataRoom.findOne({ startupId });
    if (!room) return res.status(404).json({ success: false, message: 'Data room not found' });

    if (question) {
      // New question submitted by investor
      room.questions.push({
        documentId: documentId || '',
        documentName: documentName || 'General Data Room',
        investorId: investorId || userId,
        investorName: investorName || userName || 'Investor',
        investorEmail: investorEmail || '',
        question,
        answer: '',
        status: 'pending',
        createdAt: new Date(),
      });

      room.auditLogs.push({
        userId: userId || investorId,
        userName: userName || investorName || 'Investor',
        userRole: 'investor',
        action: 'Question Submitted',
        documentName: documentName || 'General',
        details: `Question asked: "${question}"`,
        timestamp: new Date(),
      });
    } else if (questionId && answer) {
      // Founder response to question
      const targetQ = room.questions.find((q) => q._id?.toString() === questionId || (q as any).id === questionId);
      if (targetQ) {
        targetQ.answer = answer;
        targetQ.answeredAt = new Date();
        targetQ.status = 'answered';

        room.auditLogs.push({
          userId: userId || room.founderId,
          userName: userName || 'Founder',
          userRole: 'founder',
          action: 'Question Answered',
          documentName: targetQ.documentName || 'General',
          details: `Answered question from ${targetQ.investorName}: "${answer.slice(0, 40)}..."`,
          timestamp: new Date(),
        });
      }
    }

    await room.save();
    return res.json({ success: true, data: room });
  } catch (err: any) {
    console.error('Error handling Q&A:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Log Document View / Download Activity
export const logActivity = async (req: Request, res: Response) => {
  try {
    const { startupId } = req.params;
    const { userId, userName, userRole, action, documentId, documentName, details } = req.body;

    const room = await DataRoom.findOne({ startupId });
    if (!room) return res.status(404).json({ success: false, message: 'Data room not found' });

    room.auditLogs.push({
      userId: userId || 'anonymous',
      userName: userName || 'User',
      userRole: userRole || 'investor',
      action: action || 'Document Viewed',
      documentId,
      documentName,
      details,
      timestamp: new Date(),
    });

    await room.save();
    return res.json({ success: true, data: room });
  } catch (err: any) {
    console.error('Error logging activity:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// Admin View All Data Rooms
export const getAllDataRoomsAdmin = async (_req: Request, res: Response) => {
  try {
    const rooms = await DataRoom.find().sort({ updatedAt: -1 });
    return res.json({ success: true, data: rooms });
  } catch (err: any) {
    console.error('Error fetching admin data rooms:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
