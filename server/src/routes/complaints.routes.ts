import { Router } from 'express';
import {
  createComplaint,
  getComplaintByTrackingId,
  getComplaints,
  updateComplaintStatus,
  promoteComplaintToCase,
} from '../controllers/complaints.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Publicly accessible for citizen reporting and tracking without forcing prior login
router.post('/submit', createComplaint);
router.get('/track/:complaintId', getComplaintByTrackingId);

// Authenticated routes
router.use(authenticate);
router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id/status', updateComplaintStatus);
router.post('/:id/promote-case', promoteComplaintToCase);

export default router;
