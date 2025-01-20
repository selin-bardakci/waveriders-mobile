import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createRental } from '../controllers/rentalController.js';
import { getUnavailableDates } from '../controllers/rentalController.js';

const router = express.Router();

router.post('/create', authenticateToken, createRental);
router.get('/unavailable-dates', getUnavailableDates);



export default router;
