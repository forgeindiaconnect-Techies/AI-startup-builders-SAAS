import { Router } from 'express';
import { checkPlagiarism, getPlagiarismReports } from '../controllers/plagiarismController.js';

const router = Router();

router.post('/check', checkPlagiarism);
router.get('/reports/:startupId', getPlagiarismReports);

export default router;
