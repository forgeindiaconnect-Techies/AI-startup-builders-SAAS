import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AppDocument from '../models/AppDocument.js';
import { User } from '../models/User.js';

// GET /api/documents
export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const { startupId, userId } = req.query;
    const filter: any = {};
    if (startupId) filter.startupId = startupId;
    if (userId) filter.userId = userId;

    const docs = await AppDocument.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: docs });
  } catch (err) {
    console.error('Error fetching documents:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching documents' });
  }
};

// GET /api/documents/:id
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let doc = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await AppDocument.findById(id);
    }

    if (!doc) {
      doc = await AppDocument.findOne({ $or: [{ id: id }, { docId: id }] });
    }

    if (!doc) {
      if (id === 'doc_inv_101' || id === 'doc_inv_102') {
        const is101 = id === 'doc_inv_101';
        doc = new AppDocument({
          id: id,
          docId: id,
          userId: 'investor_demo_user',
          startupId: '',
          fileName: is101 ? 'Rakesh_Accreditation_PAN_Proof.pdf' : 'VC_Fund_SEBI_Registration.pdf',
          documentLabel: is101 ? 'Accredited Investor & PAN Card Proof' : 'SEBI Registration & Firm Articles of Association',
          category: 'Investor Verification',
          documentType: is101 ? 'investor_accreditation' : 'investor_sebi_reg',
          fileSize: is101 ? '1.4 MB' : '2.1 MB',
          status: is101 ? 'Pending Verification' : 'Verified',
          verifiedAt: is101 ? '' : new Date(Date.now() - 86400000).toISOString(),
        });
        await doc.save();
      } else if (id && (id.startsWith('mentor_') || id.startsWith('mentor-'))) {
        const cleanId = id.replace(/-/g, '_');
        const match = cleanId.match(/^(mentor_[a-z0-9_]+?)_([a-f0-9]{24})$/i) || cleanId.match(/^(mentor_[a-z0-9_]+?)_(.+)$/i);
        if (match) {
          const typeKey = match[1];
          const mId = match[2];
          
          const user = await User.findById(mId);
          if (user) {
            const mName = user.fullName || 'Mentor';
            const mEmail = user.email || '';
            const mStatus = user.approvalStatus === 'approved' ? 'Verified' : user.approvalStatus === 'rejected' ? 'Rejected' : 'Pending Verification';
            
            let fileName = '';
            let documentLabel = '';
            let category = 'Mentor Verification';
            let documentType = '';
            let fileSize = '1.5 MB';
            let fileUrl = '';
            
            if (typeKey === 'mentor_aadhar') {
              fileName = `${mName.replace(/\s+/g, '_')}_Aadhaar_ID_Proof.pdf`;
              documentLabel = 'Aadhaar Card ID Proof';
              documentType = 'mentor_aadhar_proof';
              category = 'ID Proof';
              fileUrl = user.aadharDocUrl || '';
            } else if (typeKey === 'mentor_pan') {
              fileName = `${mName.replace(/\s+/g, '_')}_PAN_Tax_Proof.pdf`;
              documentLabel = 'PAN Card Tax Proof';
              documentType = 'mentor_pan_proof';
              category = 'Tax / Identity Proof';
              fileUrl = user.panDocUrl || '';
            } else if (typeKey === 'mentor_other') {
              fileName = `${mName.replace(/\s+/g, '_')}_Qualification.pdf`;
              documentLabel = user.otherDocType || 'Degree / Experience Certificate';
              documentType = 'mentor_qualification_proof';
              category = user.otherDocType || 'Degree & Qualification';
              fileUrl = user.otherDocUrl || '';
            } else if (typeKey === 'mentor_resume') {
              fileName = `${mName.replace(/\s+/g, '_')}_Resume_CV.pdf`;
              documentLabel = 'Mentor Resume / CV';
              documentType = 'mentor_resume';
              category = 'Mentor Resume';
              fileUrl = user.resumeUrl || '';
            } else {
              fileName = `${mName.replace(/\s+/g, '_')}_Verification_Profile.pdf`;
              documentLabel = `Mentor Profile & Credentials Verification (${mName})`;
              documentType = 'mentor_verification';
              category = 'Mentor Verification';
            }
            
            doc = new AppDocument({
              id: id,
              docId: id,
              userId: mId,
              startupId: '',
              fileName,
              documentLabel,
              category,
              documentType,
              fileSize,
              status: mStatus,
              applyLink: fileUrl,
            });
            await doc.save();
          }
        }
      }
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Error fetching document by id:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching document' });
  }
};

// POST /api/documents
export const createDocument = async (req: Request, res: Response) => {
  try {
    const doc = new AppDocument(req.body);
    await doc.save();
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Error creating document:', err);
    return res.status(500).json({ success: false, message: 'Server error creating document' });
  }
};

// PUT /api/documents/:id
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let doc = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await AppDocument.findByIdAndUpdate(id, req.body, { new: true });
    }

    if (!doc) {
      doc = await AppDocument.findOneAndUpdate({ $or: [{ id: id }, { docId: id }] }, req.body, { new: true });
    }

    if (!doc) {
      let docObj = null;
      if (id === 'doc_inv_101' || id === 'doc_inv_102') {
        const is101 = id === 'doc_inv_101';
        docObj = new AppDocument({
          id: id,
          docId: id,
          userId: 'investor_demo_user',
          startupId: '',
          fileName: is101 ? 'Rakesh_Accreditation_PAN_Proof.pdf' : 'VC_Fund_SEBI_Registration.pdf',
          documentLabel: is101 ? 'Accredited Investor & PAN Card Proof' : 'SEBI Registration & Firm Articles of Association',
          category: 'Investor Verification',
          documentType: is101 ? 'investor_accreditation' : 'investor_sebi_reg',
          fileSize: is101 ? '1.4 MB' : '2.1 MB',
          status: is101 ? 'Pending Verification' : 'Verified',
          verifiedAt: is101 ? '' : new Date(Date.now() - 86400000).toISOString(),
        });
        await docObj.save();
      } else if (id && (id.startsWith('mentor_') || id.startsWith('mentor-'))) {
        const cleanId = id.replace(/-/g, '_');
        const match = cleanId.match(/^(mentor_[a-z0-9_]+?)_([a-f0-9]{24})$/i) || cleanId.match(/^(mentor_[a-z0-9_]+?)_(.+)$/i);
        if (match) {
          const typeKey = match[1];
          const mId = match[2];
          const user = await User.findById(mId);
          if (user) {
            const mName = user.fullName || 'Mentor';
            const mEmail = user.email || '';
            const mStatus = user.approvalStatus === 'approved' ? 'Verified' : user.approvalStatus === 'rejected' ? 'Rejected' : 'Pending Verification';
            let fileName = '';
            let documentLabel = '';
            let category = 'Mentor Verification';
            let documentType = '';
            let fileSize = '1.5 MB';
            let fileUrl = '';
            
            if (typeKey === 'mentor_aadhar') {
              fileName = `${mName.replace(/\s+/g, '_')}_Aadhaar_ID_Proof.pdf`;
              documentLabel = 'Aadhaar Card ID Proof';
              documentType = 'mentor_aadhar_proof';
              category = 'ID Proof';
              fileUrl = user.aadharDocUrl || '';
            } else if (typeKey === 'mentor_pan') {
              fileName = `${mName.replace(/\s+/g, '_')}_PAN_Tax_Proof.pdf`;
              documentLabel = 'PAN Card Tax Proof';
              documentType = 'mentor_pan_proof';
              category = 'Tax / Identity Proof';
              fileUrl = user.panDocUrl || '';
            } else if (typeKey === 'mentor_other') {
              fileName = `${mName.replace(/\s+/g, '_')}_Qualification.pdf`;
              documentLabel = user.otherDocType || 'Degree / Experience Certificate';
              documentType = 'mentor_qualification_proof';
              category = user.otherDocType || 'Degree & Qualification';
              fileUrl = user.otherDocUrl || '';
            } else if (typeKey === 'mentor_resume') {
              fileName = `${mName.replace(/\s+/g, '_')}_Resume_CV.pdf`;
              documentLabel = 'Mentor Resume / CV';
              documentType = 'mentor_resume';
              category = 'Mentor Resume';
              fileUrl = user.resumeUrl || '';
            } else {
              fileName = `${mName.replace(/\s+/g, '_')}_Verification_Profile.pdf`;
              documentLabel = `Mentor Profile & Credentials Verification (${mName})`;
              documentType = 'mentor_verification';
              category = 'Mentor Verification';
            }
            
            docObj = new AppDocument({
              id: id,
              docId: id,
              userId: mId,
              startupId: '',
              fileName,
              documentLabel,
              category,
              documentType,
              fileSize,
              status: mStatus,
              applyLink: fileUrl,
            });
            await docObj.save();
          }
        }
      }
      
      if (docObj) {
        doc = await AppDocument.findOneAndUpdate({ $or: [{ id: id }, { docId: id }] }, req.body, { new: true });
      }
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found in backend DB' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Error updating document:', err);
    return res.status(500).json({ success: false, message: 'Server error updating document' });
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)) {
      await AppDocument.findByIdAndDelete(id);
    } else {
      await AppDocument.findOneAndDelete({ $or: [{ id: id }, { docId: id }] });
    }

    return res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err);
    return res.status(200).json({ success: false, message: 'Could not delete document from backend DB' });
  }
};
