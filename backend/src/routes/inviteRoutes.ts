import { Router } from 'express';
import {
  createMentorInvite,
  getInviteByToken,
  resendInvite,
  markInviteUsed,
  listInvites,
  updateInvite,
  deleteInvite,
} from '../controllers/inviteController.js';

const router = Router();

router.post('/mentor', createMentorInvite);
router.get('/', listInvites);
router.get('/:token', getInviteByToken);
router.post('/:token/use', markInviteUsed);
router.post('/:token/resend', resendInvite);
router.put('/:token', updateInvite);
router.delete('/:token', deleteInvite);

export default router;
