import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AppDocument from '../models/AppDocument.js';

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
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Error fetching document by id:', err);
    return res.status(200).json({ success: false, message: 'Document not found in backend DB' });
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
      return res.status(404).json({ success: false, message: 'Document not found in backend DB' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Error updating document:', err);
    return res.status(200).json({ success: false, message: 'Could not update document in backend DB' });
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
