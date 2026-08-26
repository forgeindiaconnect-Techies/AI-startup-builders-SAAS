import mongoose from 'mongoose';

export interface IKnowledgeChunk extends mongoose.Document {
  startupId: string;
  userId: string;
  docId: string;        // shared across all chunks of the same upload
  filename: string;
  fileType: string;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
  pageNumber: number;
  chunkIndex: number;
  text: string;
  embedding: number[];  // Gemini text-embedding-004 produces 768-dim vectors
  charCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeChunkSchema = new mongoose.Schema(
  {
    startupId: { type: String, required: true, index: true },
    userId:    { type: String, required: true, index: true },
    docId:     { type: String, required: true, index: true }, // all chunks of one file share this
    filename:  { type: String, required: true },
    fileType:  { type: String, required: true },
    status:    {
      type: String,
      enum: ['uploading', 'processing', 'indexed', 'error'],
      default: 'uploading',
    },
    pageNumber:  { type: Number, default: 1 },
    chunkIndex:  { type: Number, required: true },
    text:        { type: String, required: true },
    embedding:   { type: [Number], required: true },
    charCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for fast per-startup retrieval
knowledgeChunkSchema.index({ startupId: 1, docId: 1 });

export const KnowledgeChunk = mongoose.model<IKnowledgeChunk>(
  'KnowledgeChunk',
  knowledgeChunkSchema
);

// ─── Document-level metadata (one record per uploaded file) ───────────────────

export interface IKnowledgeDoc extends mongoose.Document {
  startupId: string;
  userId: string;
  docId: string;
  filename: string;
  fileType: string;
  fileUrl?: string;
  cloudinaryPublicId?: string;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
  chunkCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeDocSchema = new mongoose.Schema(
  {
    startupId:          { type: String, required: true, index: true },
    userId:             { type: String, required: true },
    docId:              { type: String, required: true, unique: true },
    filename:           { type: String, required: true },
    fileType:           { type: String, required: true },
    fileUrl:            { type: String },
    cloudinaryPublicId: { type: String },
    status:             {
      type: String,
      enum: ['uploading', 'processing', 'indexed', 'error'],
      default: 'uploading',
    },
    chunkCount:   { type: Number, default: 0 },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const KnowledgeDoc = mongoose.model<IKnowledgeDoc>(
  'KnowledgeDoc',
  knowledgeDocSchema
);
