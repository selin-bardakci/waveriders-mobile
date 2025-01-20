import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js'; 
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import multer from 'multer'; // For file handling if needed

const app = express();
console.log('Loaded Environment Variables:', process.env);
// Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase JSON body size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded body size limit

// Initialize the database connection
const db = connectDB();

// Middleware to attach the database instance
app.use((req, res, next) => {
  req.db = db; // Attach the database instance to the request object
  next();
});

// Route handlers
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/listings', listingRoutes); // Listings routes
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

