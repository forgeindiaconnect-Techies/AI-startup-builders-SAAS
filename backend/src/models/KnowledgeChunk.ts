import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema({
  startupId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  docId: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  fileType: { type: String, required: true },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'indexed', 'error'],
    default: 'uploading',
  },
  pageNumber: { type: Number, default: 1 },
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  charCount: { type: Number, default: 0 },
}, { timestamps: true });

// Compound index for fast per-startup retrieval
knowledgeChunkSchema.index({ startupId: 1, docId: 1 });

export const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);

const knowledgeDocSchema = new mongoose.Schema({
  startupId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  docId: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  fileType: { type: String, required: true },
  fileUrl: { type: String },
  cloudinaryPublicId: { type: String },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'indexed', 'error'],
    default: 'uploading',
  },
  chunkCount: { type: Number, default: 0 },
  errorMessage: { type: String },
}, { timestamps: true });

export const KnowledgeDoc = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
