import { Router } from 'express';
import { validatePayment } from '../controllers/card.controller';
import { cardRequestValidator } from '../validation';

const router = Router();

// Apply parseBody middleware specifically for the /validate route if needed
router.post('/validate', cardRequestValidator, validatePayment);

export default router;
