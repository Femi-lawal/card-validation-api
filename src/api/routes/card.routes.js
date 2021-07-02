import { Router } from 'express';
import { validatePayment } from '../controllers/card.controller';
import { cardRequestValidator } from '../validation';
import parsebody from '../../middleware/parseBody';
const router = Router();

router.post('/validate', cardRequestValidator, validatePayment);

export default router;
