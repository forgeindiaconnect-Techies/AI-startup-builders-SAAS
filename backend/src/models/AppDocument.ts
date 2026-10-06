import mongoose, { Schema } from 'mongoose';

const AppDocumentSchema = new Schema({
  id: { type: String, default: '' },
  docId: { type: String, default: '' },
  startupId: { type: String, default: '' },
  userId: { type: String, default: '' },
  fileName: { type: String, required: true },
  category: { type: String, default: 'General' },
  fileSize: { type: String, default: '1.2 MB' },
  documentType: { type: String, default: '' },
  documentLabel: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  sharedWith: [{ type: String }],
  applyLink: { type: String, default: '' },
  verifiedAt: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('AppDocument', AppDocumentSchema);
