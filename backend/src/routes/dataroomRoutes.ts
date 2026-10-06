import { Router } from 'express';
import {
  getDataRoomByStartup,
  getInvestorDataRooms,
  addDocument,
  updateDocument,
  manageInvestorAccess,
  addQuestionOrAnswer,
  logActivity,
  getAllDataRoomsAdmin,
} from '../controllers/dataroomController.js';

const router = Router();


router.post('/startup/:startupId/access', manageInvestorAccess);
router.post('/startup/:startupId/qa', addQuestionOrAnswer);
router.post('/startup/:startupId/log', logActivity);

export default router;
