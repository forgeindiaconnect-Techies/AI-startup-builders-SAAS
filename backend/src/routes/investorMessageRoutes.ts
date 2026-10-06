import { Router } from 'express';
import { getInvestorMessages, createInvestorMessage } from '../controllers/investorMessageController.js';

const router = Router();

router.get('/investor-messages', getInvestorMessages);
router.post('/investor-messages', createInvestorMessage);

export default router;
