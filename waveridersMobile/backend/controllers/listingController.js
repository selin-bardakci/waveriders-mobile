import { connectDB } from '../config/db.js';
import { Listing } from '../models/listingModel.js';
import { uploadToS3 } from '../config/s3.js'; // S3 upload logic
import path from 'path'; // Module for resolving file paths
import multer from 'multer'; // Multer for handling file uploads
import fs from 'fs/promises'; // File system for async operations

const db = connectDB();

// Configure Multer for handling photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/photos'; // Directory for photos
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

export const uploadPhotos = upload.array('photos', 5); // Middleware for handling multiple files

// Controller for creating a boat listing
export const createListing = async (req, res) => {
  try {
    console.log('Received Files:', req.files); // Log uploaded files
    console.log('Request Body:', req.body); // Log form data

    const {
      boat_name: boatName,
      boat_type: boatType,
      capacity,
      price_per_hour: pricePerHour,
      price_per_day: pricePerDay,
      description,
      location,
      business_id: businessId,
    } = req.body;

    if (!boatName || !boatType || !capacity || !pricePerHour || !description || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'All fields and at least one photo are required' });
    }

    // Upload files to S3
    const s3Urls = [];
    for (const file of req.files) {
      try {
        const fullPath = path.resolve(file.path);
        console.log('Uploading file to S3:', fullPath);
        const s3Url = await uploadToS3(fullPath, process.env.AWS_S3_BUCKET);
        console.log('Uploaded to S3:', s3Url);
        s3Urls.push(s3Url);

        // Optionally delete the local file after uploading to S3
        await fs.unlink(fullPath);
      } catch (uploadError) {
        console.error(`Error uploading file ${file.path} to S3:`, uploadError);
        return res.status(500).json({ error: 'Failed to upload photos to S3' });
      }
    }

    console.log('Uploaded S3 URLs:', s3Urls);

    // Insert listing data into the database
    const listingData = {
      boat_name: boatName,
      description,
      trip_types: req.body.trip_types || '',
      price_per_hour: pricePerHour,
      price_per_day: pricePerDay || null,
      capacity,
      boat_type: boatType,
      location,
      business_id: businessId,
      photos: JSON.stringify(s3Urls), // Store photo URLs
    };

    console.log('Inserting Data:', listingData);

    const newListing = await db.insert('boats', listingData); // Replace with your DB insertion logic

    return res.status(201).json({
      message: 'Listing created successfully',
      listing: newListing,
    });
  } catch (error) {
    console.error('Error in createListing:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for fetching all listings
export const fetchListings = async (req, res) => {
  try {
    Listing.findAllListings(db, (err, results) => {
      if (err) {
        console.error('Error fetching listings:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('Fetched Listings:', results);
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for fetching a listing by ID
export const fetchListingById = async (req, res) => {
  const listingId = req.params.id;

  try {
    Listing.findListingById(db, listingId, (err, result) => {
      if (err) {
        console.error('Error fetching listing:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!result.length) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      res.status(200).json(result[0]);
    });
  } catch (error) {
    console.error('Error fetching listing by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for deleting a listing by ID
export const deleteListing = async (req, res) => {
  const listingId = req.params.id;

  try {
    Listing.deleteListingById(db, listingId, (err, result) => {
      if (err) {
        console.error('Error deleting listing:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      res.status(200).json({ message: 'Listing deleted successfully' });
    });
  } catch (error) {
    console.error('Error in deleteListing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
