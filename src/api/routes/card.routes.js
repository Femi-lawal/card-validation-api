import { Router } from 'express';
import { validateCard } from '../controllers/card.controller';
import { cardRequestValidator } from '../validation';

const router = Router();

// Apply parseBody middleware specifically for the /validate route if needed
router.post('/validate', cardRequestValidator, validateCard);

export default router;
