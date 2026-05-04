import { Router } from 'express';
import {
  getAllBidding,
  getBiddingById,
  getCategories,
  getModalidades,
} from '../controllers/biddingController';

const router = Router();

router.get('/', getAllBidding);
router.get('/categorias', getCategories);
router.get('/modalidades', getModalidades);
router.get('/:id', getBiddingById);

export default router;