import { Router } from 'express';
import cardRoutes from './card.routes';
import healthRoutes from './health.routes'; // Import health routes
import parseBody from '../../middleware/parseBody';

const router = Router();

router.use('/cards', parseBody, cardRoutes);
router.use('/health', healthRoutes); // Use health routes

export default router;
