import { Router } from 'express';
import {
  getMeetings,
  createMeeting,
  updateMeeting,
} from '../controllers/investorMeetingController.js';

const router = Router();

router.get('/', getMeetings);
router.post('/', createMeeting);
router.patch('/:id', updateMeeting);
router.put('/:id', updateMeeting);

export default router;
