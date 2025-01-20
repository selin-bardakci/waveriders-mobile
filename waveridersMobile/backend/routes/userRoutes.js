import express from 'express';
import { getUserProfile, updateUserProfile,getBusinessProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);

router.put('/profile', authenticateToken, updateUserProfile);

router.get('/business', authenticateToken, getBusinessProfile);

export default router;
