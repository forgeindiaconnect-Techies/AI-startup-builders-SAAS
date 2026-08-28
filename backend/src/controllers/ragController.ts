import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';
import { KnowledgeChunk, KnowledgeDoc } from '../models/KnowledgeChunk.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// ─── Cloudinary setup ────────────────────────────────────────────────────────
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

// ─── Multer setup (memory storage — parse immediately, never write to disk) ───
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype) ||
        file.originalname.match(/\.(pdf|docx|txt|csv|xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Use PDF, DOCX, TXT, CSV, or XLSX.'));
    }
  },
});

// ─── Gemini embedding client ───────────────────────────────────────────────────
let gemini: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getEmbedding(text: string, retries = 5, delay = 2000): Promise<number[]> {
  if (!gemini) throw new Error('GEMINI_API_KEY not set');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await gemini.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
      });
      return res.embeddings?.[0]?.values ?? [];
    } catch (err: any) {
      const isRateLimit = err.status === 'RESOURCE_EXHAUSTED' || 
                          err.message?.includes('429') || 
                          err.message?.includes('Quota exceeded') ||
                          err.message?.includes('RESOURCE_EXHAUSTED');

      if (isRateLimit && attempt < retries) {
        let waitMs = delay * attempt; // 2s, 4s, 6s, 8s...
        const match = err.message?.match(/retry in ([0-9.]+)s/i);
        if (match && match[1]) {
          waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
        }
        console.warn(`⚠️ Gemini embedding rate limit hit (429). Retrying attempt ${attempt}/${retries} in ${Math.round(waitMs / 1000)}s...`);
        await sleep(waitMs);
        continue;
      }

      if (attempt === retries) {
        try {
          const res = await gemini.models.embedContent({
            model: 'gemini-embedding-2',
            contents: text,
          });
          return res.embeddings?.[0]?.values ?? [];
        } catch (fallbackErr: any) {
          if (isRateLimit) {
            throw new Error('Gemini API rate limit exceeded (100 embeddings/min limit). Please try again in 30 seconds.');
          }
          throw fallbackErr;
        }
      }
      throw err;
    }
  }
  return [];
}

// ─── Text extraction ──────────────────────────────────────────────────────────

async function extractText(
  buffer: Buffer,
  mimetype: string,
  originalname: string
): Promise<{ text: string; pages: string[] }> {
  const ext = originalname.toLowerCase().split('.').pop();

  // PDF
  if (mimetype === 'application/pdf' || ext === 'pdf') {
    let text = '';
    let pages: string[] = [];
    let parserInstance: any = null;

    try {
      // 1. Try PDFParse (v2 class API)
      try {
        await import('pdf-parse/worker');
        const pdfModule: any = await import('pdf-parse');
        const PDFParseClass = pdfModule.PDFParse || (pdfModule.default && pdfModule.default.PDFParse);
        if (typeof PDFParseClass === 'function') {
          const uint8 = new Uint8Array(buffer);
          parserInstance = new PDFParseClass(uint8);
          const result = await parserInstance.getText();
          text = result.text || '';
          if (result.pages && Array.isArray(result.pages)) {
            pages = result.pages.map((p: any) => p.text).filter((t: string) => t && t.trim().length > 0);
          }
        }
      } catch (v2Err: any) {
        console.warn('⚠️ PDFParse v2 class extraction failed, falling back to v1 function:', v2Err?.message);
      }

      // 2. Fallback to pdf-parse (v1 function API) if v2 didn't extract text
      if (!text.trim()) {
        const pdfImport: any = await import('pdf-parse');
        const pdfFn = pdfImport.default || pdfImport;
        if (typeof pdfFn === 'function') {
          const data = await pdfFn(buffer);
          text = data.text || '';
          pages = text.split('\f').filter((p: string) => p.trim().length > 0);
        } else if (typeof pdfImport === 'function') {
          const data = await pdfImport(buffer);
          text = data.text || '';
          pages = text.split('\f').filter((p: string) => p.trim().length > 0);
        }
      }

      if (!text.trim()) {
        throw new Error('Extracted text is empty. The PDF might be scanned/image-only (requires OCR), corrupted, or blank.');
      }

      return { text, pages: pages.length ? pages : [text] };
    } catch (err: any) {
      let message = err.message || 'Unknown PDF parsing error';
      if (message.includes('Password') || message.includes('password') || err.name === 'PasswordException') {
        message = 'Failed to parse PDF: The document is encrypted or password-protected.';
      } else if (message.includes('empty') || buffer.length === 0) {
        message = 'Failed to parse PDF: The document is empty (0 bytes).';
      } else if (message.includes('structure') || message.includes('Invalid') || err.name === 'InvalidPDFException') {
        message = 'Failed to parse PDF: The document is corrupted or has an invalid structure.';
      }
      throw new Error(message);
    } finally {
      if (parserInstance && typeof parserInstance.destroy === 'function') {
        try {
          await parserInstance.destroy();
        } catch (e) {
          // ignore destroy errors
        }
      }
    }
  }

  // DOCX
  if (
    mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, pages: [result.value] };
  }

  // TXT
  if (mimetype === 'text/plain' || ext === 'txt') {
    const text = buffer.toString('utf-8');
    return { text, pages: [text] };
  }

  // CSV
  if (mimetype === 'text/csv' || ext === 'csv') {
    const { parse } = await import('csv-parse/sync');
    const records = parse(buffer, { columns: true, skip_empty_lines: true });
    const text = (records as any[])
      .map((row: any) =>
        Object.entries(row)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      )
      .join('\n');
    return { text, pages: [text] };
  }

  // XLSX / XLS
  if (
    mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.ms-excel' ||
    ext === 'xlsx' ||
    ext === 'xls'
  ) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const lines: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      lines.push(`Sheet: ${sheetName}\n${csv}`);
    }
    const text = lines.join('\n\n');
    return { text, pages: [text] };
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
}

// ─── Chunking ─────────────────────────────────────────────────────────────────

function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) chunks.push(chunk); // skip tiny leftover chunks
    start += chunkSize - overlap;
  }
  return chunks;
}

// ─── Cosine similarity ────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── Public: retrieve top-K chunks for a startup question ─────────────────────

export interface ChunkResult {
  text: string;
  filename: string;
  pageNumber: number;
  chunkIndex: number;
  score: number;
  matchType: 'vector' | 'keyword';
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

// ─── Public: retrieve top-K chunks for a startup question ─────────────────────

export async function retrieveContext(
  question: string,
  startupId: string,
  userId?: string,
  topK = 8,
  minThreshold = 0.25
): Promise<ChunkResult[]> {
  const normQuestion = normalizeText(question);
  console.log(`🔍 RAG Query [startupId=${startupId}, userId=${userId || 'any'}]: "${question}"`);

  let results: ChunkResult[] = [];

  // 1. Vector Similarity Search
  try {
    const qEmbedding = await getEmbedding(normQuestion);

    const queryFilter: any = { startupId, status: 'indexed' };
    if (userId) queryFilter.userId = userId;

    const storedChunks = await KnowledgeChunk.find(
      queryFilter,
      { text: 1, embedding: 1, filename: 1, pageNumber: 1, chunkIndex: 1, userId: 1 }
    ).lean();

    if (storedChunks.length > 0 && qEmbedding.length > 0) {
      const scored: ChunkResult[] = [];
      for (const chunk of storedChunks) {
        // Requirement 8: Verify vector dimensions match
        if (!chunk.embedding || chunk.embedding.length !== qEmbedding.length) {
          continue;
        }
        const score = cosineSimilarity(qEmbedding, chunk.embedding);
        if (score >= minThreshold) {
          scored.push({
            text: chunk.text,
            filename: chunk.filename,
            pageNumber: chunk.pageNumber || 1,
            chunkIndex: chunk.chunkIndex,
            score,
            matchType: 'vector',
          });
        }
      }

      // Sort by similarity score descending
      scored.sort((a, b) => b.score - a.score);

      // Requirement 9: Remove duplicate chunks, keep highest scoring
      const seenTexts = new Set<string>();
      for (const item of scored) {
        const key = item.text.slice(0, 100);
        if (!seenTexts.has(key)) {
          seenTexts.add(key);
          results.push(item);
        }
        if (results.length >= topK) break;
      }
    }
  } catch (vecErr: any) {
    console.error(`❌ RAG Vector Search Error for query "${question}":`, vecErr?.message || vecErr);
  }

  // Requirement 10: Fallback Keyword Search if vector search returns no results
  if (results.length === 0) {
    console.log(`⚠️ RAG Vector Search yielded 0 chunks for "${question}". Attempting Keyword Fallback...`);
    try {
      const stopwords = new Set(['what', 'is', 'a', 'the', 'and', 'or', 'of', 'for', 'in', 'to', 'how', 'explain', 'are', 'main', 'with', 'about']);
      const keywords = normQuestion
        .split(/[^a-z0-9]+/i)
        .filter(w => w.length > 2 && !stopwords.has(w));

      if (keywords.length > 0) {
        const regexPatterns = keywords.map(kw => new RegExp(kw, 'i'));
        const queryFilter: any = { 
          startupId, 
          status: 'indexed',
          $or: regexPatterns.map(pattern => ({ text: pattern }))
        };
        if (userId) queryFilter.userId = userId;

        const kwChunks = await KnowledgeChunk.find(
          queryFilter,
          { text: 1, filename: 1, pageNumber: 1, chunkIndex: 1 }
        ).limit(topK).lean();

        for (const chunk of kwChunks) {
          const lowerText = chunk.text.toLowerCase();
          let hitCount = 0;
          for (const kw of keywords) {
            if (lowerText.includes(kw)) hitCount++;
          }
          const score = 0.3 + (hitCount / keywords.length) * 0.2;
          results.push({
            text: chunk.text,
            filename: chunk.filename,
            pageNumber: chunk.pageNumber || 1,
            chunkIndex: chunk.chunkIndex,
            score,
            matchType: 'keyword',
          });
        }
      }
    } catch (kwErr: any) {
      console.error(`❌ RAG Keyword Search Error:`, kwErr?.message || kwErr);
    }
  }

  // Requirement 4: Log query, scores, document name, page number, and snippet
  console.log(`📊 RAG Retrieval Complete: ${results.length} chunk(s) matched for "${question}".`);
  results.forEach((r, idx) => {
    console.log(`  [Chunk ${idx + 1}] Score: ${r.score.toFixed(3)} | Type: ${r.matchType} | File: ${r.filename} (p.${r.pageNumber}) | Snippet: "${r.text.slice(0, 80)}..."`);
  });

  return results;
}

// ─── Route handlers ───────────────────────────────────────────────────────────

// POST /api/rag/upload  (multipart/form-data: files[], startupId)
export const uploadDocs = async (req: AuthRequest, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[];
  const { startupId } = req.body;
  const userId = req.user?.id;

  if (!files || files.length === 0) {
    res.status(400).json({ success: false, error: 'No files uploaded' });
    return;
  }
  if (!startupId) {
    res.status(400).json({ success: false, error: 'startupId is required' });
    return;
  }

  // Return immediately with docIds — processing happens async
  const docIds: string[] = files.map(() => uuidv4());

  // Acknowledge fast
  res.status(202).json({
    success: true,
    message: `${files.length} file(s) received. Processing in background.`,
    docs: files.map((f, i) => ({
      docId: docIds[i],
      filename: f.originalname,
      status: 'uploading',
    })),
  });

  // Process each file in background
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const docId = docIds[i];

    // Create doc record with 'uploading' status
    await KnowledgeDoc.create({
      startupId,
      userId,
      docId,
      filename: file.originalname,
      fileType: file.mimetype,
      status: 'uploading',
      chunkCount: 0,
    });

    // Process async (no await — fire and forget per file)
    processFile(file, docId, startupId, userId || '').catch(err => {
      console.error(`❌ RAG processing failed for ${file.originalname}:`, err);
      KnowledgeDoc.updateOne(
        { docId },
        { status: 'error', errorMessage: err.message }
      ).catch(console.error);
    });
  }
};

async function processFile(
  file: Express.Multer.File,
  docId: string,
  startupId: string,
  userId: string
) {
  try {
    // Mark as processing
    await KnowledgeDoc.updateOne({ docId }, { status: 'processing' });

    // 1. Extract text
    const { text, pages } = await extractText(
      file.buffer,
      file.mimetype,
      file.originalname
    );

    if (!text.trim()) {
      await KnowledgeDoc.updateOne(
        { docId },
        { status: 'error', errorMessage: 'No extractable text found in document.' }
      );
      return;
    }

    // 2. Chunk (page-aware: chunk within each page, track page number)
    const allChunks: { text: string; page: number; index: number }[] = [];
    let globalIndex = 0;
    for (let p = 0; p < pages.length; p++) {
      const pageChunks = chunkText(pages[p], 1000, 200);
      for (const chunk of pageChunks) {
        allChunks.push({ text: chunk, page: p + 1, index: globalIndex++ });
      }
    }

    // 3. Embed chunks in controlled batch concurrency of 3 for 3x speedup
    const savedChunks: any[] = [];
    const batchSize = 3;
    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async chunk => {
          try {
            const embedding = await getEmbedding(chunk.text);
            if (embedding && embedding.length > 0) {
              return {
                startupId,
                userId,
                docId,
                filename: file.originalname,
                fileType: file.mimetype,
                status: 'indexed',
                pageNumber: chunk.page,
                chunkIndex: chunk.index,
                text: chunk.text,
                embedding,
                charCount: chunk.text.length,
              };
            }
          } catch (e: any) {
            console.warn(`⚠️ Failed to embed chunk ${chunk.index} of ${file.originalname}:`, e?.message);
          }
          return null;
        })
      );

      for (const item of results) {
        if (item) savedChunks.push(item);
      }

      await sleep(150); // Rate limit throttle between batches
    }

    if (savedChunks.length === 0) {
      await KnowledgeDoc.updateOne(
        { docId },
        { status: 'error', errorMessage: 'Embedding generation failed for all chunks.' }
      );
      return;
    }

    // 4. Upload raw document to Cloudinary (if configured)
    let fileUrl = '';
    let cloudinaryPublicId = '';
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: `startup_knowledge/${startupId}`,
              public_id: docId,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        fileUrl = uploadResult?.secure_url || uploadResult?.url || '';
        cloudinaryPublicId = uploadResult?.public_id || '';
        console.log(`☁️ Cloudinary upload success for ${file.originalname}: ${fileUrl}`);
      } catch (cloudErr) {
        console.warn(`⚠️ Cloudinary upload warning for ${file.originalname}:`, cloudErr);
      }
    }

    await KnowledgeChunk.insertMany(savedChunks);
    await KnowledgeDoc.updateOne(
      { docId },
      { 
        status: 'indexed', 
        chunkCount: savedChunks.length,
        fileUrl,
        cloudinaryPublicId
      }
    );

    console.log(
      `✅ RAG: ${file.originalname} indexed — ${savedChunks.length} chunks for startup ${startupId}`
    );
  } catch (err: any) {
    console.error(`❌ RAG processing failed for ${file.originalname}:`, err);
    await KnowledgeDoc.updateOne(
      { docId },
      { status: 'error', errorMessage: err.message || 'Unknown processing error' }
    );
  }
}

// GET /api/rag/documents/:startupId
export const listDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { startupId } = req.params;
  try {
    const docs = await KnowledgeDoc.find({ startupId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, documents: docs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/rag/document/:docId
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const { docId } = req.params;
  try {
    await KnowledgeChunk.deleteMany({ docId });
    await KnowledgeDoc.deleteOne({ docId });
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/rag/reindex/:docId  — re-run from existing buffer (not supported for binary; instruct user to re-upload)
export const getDocStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { docId } = req.params;
  try {
    const doc = await KnowledgeDoc.findOne({ docId }).lean();
    if (!doc) {
      res.status(404).json({ success: false, error: 'Document not found' });
      return;
    }
    res.json({ success: true, document: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
