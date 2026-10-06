import express from 'express';
import { uploadDocs, listDocuments, deleteDocument, getDocStatus, upload } from '../controllers/ragController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.array('files', 10), uploadDocs);
router.get('/documents/:startupId', protect, listDocuments);
router.delete('/document/:docId', protect, deleteDocument);
router.get('/status/:docId', protect, getDocStatus);

export default router;
