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

router.get('/startup/:startupId', getDataRoomByStartup);
router.get('/investor/accessible', getInvestorDataRooms);
router.get('/admin/all', getAllDataRoomsAdmin);
router.post('/startup/:startupId/documents', addDocument);
router.put('/startup/:startupId/documents/:docId', updateDocument);
router.post('/startup/:startupId/access', manageInvestorAccess);
router.post('/startup/:startupId/qa', addQuestionOrAnswer);
router.post('/startup/:startupId/log', logActivity);

export default router;
