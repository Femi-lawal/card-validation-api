import { Router } from 'express';
import CardController from '../controllers/card.controller';
import { cardRequestValidator } from '../validation';
const router = Router();

router.post('/validate', cardRequestValidator, CardController.validatePayment);

export default router;
