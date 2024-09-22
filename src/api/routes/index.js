import { Router } from 'express';
import cardRoutes from './card.routes';
const router = Router();

router.use('/cards', cardRoutes); // Remove global parseBody

export default router;
