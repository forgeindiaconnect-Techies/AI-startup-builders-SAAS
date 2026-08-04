import { Router } from 'express';
import {
  createMentorInvite,
  getInviteByToken,
  resendInvite,
  markInviteUsed,
  listInvites,
} from '../controllers/inviteController.js';

const router = Router();

router.post('/mentor', createMentorInvite);
router.get('/', listInvites);
router.get('/:token', getInviteByToken);
router.post('/:token/use', markInviteUsed);
router.post('/:token/resend', resendInvite);

export default router;
