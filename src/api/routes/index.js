import { Router } from 'express';
import cardRoutes from './card.routes';
import parseBody from '../../middleware/parseBody';
const router = Router();

router.use('/cards', parseBody, cardRoutes);

export default router;
