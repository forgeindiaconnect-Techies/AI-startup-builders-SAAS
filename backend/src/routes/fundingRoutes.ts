import { Router } from 'express';
import {
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getAllConnectionRequests,
  createConnectionRequest,
  updateConnectionRequestStatus,
} from '../controllers/fundingController.js';

const router = Router();

router.get('/connection-requests', getAllConnectionRequests);
router.post('/connection-requests', createConnectionRequest);
router.patch('/connection-requests/:id', updateConnectionRequestStatus);

router.get('/', getAllOffers);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

export default router;

