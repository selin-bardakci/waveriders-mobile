import express from 'express';
import { createListing, fetchListings, fetchListingById, deleteListing, uploadPhotos } from '../controllers/listingController.js';

const router = express.Router();

router.post('/create_listing', uploadPhotos, createListing); // Ensure Multer middleware is included
router.get('/listings', fetchListings);
router.get('/listing/:id', fetchListingById);
router.delete('/listing/:id', deleteListing);

export default router;
