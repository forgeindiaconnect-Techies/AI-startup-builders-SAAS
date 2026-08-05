import mongoose, { Schema, Document } from 'mongoose';

export interface IAppDocument extends Document {
  id?: string;
  startupId?: string;
  userId?: string;
  fileName: string;
  category?: string;
  fileSize?: string;
  documentType?: string;
  documentLabel?: string;
  status?: string;
  sharedWith?: string[];
  applyLink?: string;
  verifiedAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppDocumentSchema: Schema = new Schema(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model<IAppDocument>('AppDocument', AppDocumentSchema);
