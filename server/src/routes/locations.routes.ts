import { Router } from 'express';
import {
  getCaseLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locations.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/case/:caseId', getCaseLocations);
router.post('/', createLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router;
