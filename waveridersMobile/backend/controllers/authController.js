import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js'; 
import { User } from '../models/userModel.js';
import { Business } from '../models/businessModel.js';
import { Boat } from '../models/boatModel.js';
import { Captain } from '../models/captainModel.js';
import multer from 'multer';
import path from 'path';
import { uploadToS3 } from '../config/s3.js';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';



const db = connectDB();

// Account setup for choosing between business or customer account
export const accountSetup = (req, res) => {
  const { selectedOption } = req.body;  // Get the selected option from the request body

  if (!selectedOption) {
    return res.status(400).json({ message: 'No option selected' });
  }

  // Handle the logic based on the selected option
  if (selectedOption === 'customer') {
    res.status(200).json({ message: 'Customer account setup' });
  } else if (selectedOption === 'business') {
    res.status(200).json({ message: 'Business account setup' });
  } else {
    res.status(400).json({ message: 'Invalid option' });
  }
};


// Register a business account (business owner registration)
export const registerBusiness = async (req, res) => {
  console.log("registerBusiness controller function hit");
  console.log("Request body:", req.body);

  const { first_name, last_name, business_name, email, phone_number, password } = req.body;

  // Check for either full name or business name (mutual exclusivity)
  const hasFirstNameAndLastName = first_name?.trim() && last_name?.trim();
  const hasBusinessName = business_name?.trim();

  if (!(hasFirstNameAndLastName || hasBusinessName)) {
      return res.status(400).json({ message: 'Please provide either first and last names, or a business name.' });
  }

  // Check for other required fields
  if (!email || !phone_number || !password) {
      return res.status(400).json({ message: 'Email, phone number, and password are required.' });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user with account_type as 'business_owner'
      User.createUser(db, {
        first_name: hasFirstNameAndLastName ? first_name : null,
        last_name: hasFirstNameAndLastName ? last_name : null,
        email,
        password: hashedPassword,
        phone_number,
        date_of_birth: "0000-00-00", // Default date for business registrations
        account_type: 'business'
    }, (err, result) => {
        if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    
        const userId = result.insertId;
    
        Business.createBusiness(db, {
            user_id: userId, business_name: hasBusinessName || null 
        }, (err) => {
            if (err) {
                console.error('Error creating business:', err);
                return res.status(500).json({ message: 'Error creating business' });
            }
    
            Business.searchBusiness(db, userId, (err, businessResult) => {
                if (err) {
                    console.error('Error searching business:', err);
                    return res.status(500).json({ message: 'Error searching business' });
                }
    
                const businessId = businessResult[0].business_id;
                res.status(200).json({ message: 'Business registration successful', user_id: userId, business_id: businessId });
            });
        });
    });

  } catch (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ message: 'Server error' });
  }
};



export const registerUser = async (req, res) => {
  console.log("registerUser controller function hit");
  console.log("Request body:", req.body);
  const { name, lastname, email, password, phone,  birthdate } = req.body;

  if (!name || !lastname || !email || !password || !phone || !birthdate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    User.createUser(db, {
      first_name: name,
      last_name: lastname,
      email,
      password: hashedPassword,
      phone_number: phone,
      date_of_birth: birthdate,
      account_type: 'customer'
    }, (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(200).json({ message: 'Registration successful' });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const boatLicenseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/boatlicenses'); // Path for boat licenses
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadBoatLicense = multer({ storage: boatLicenseStorage });

// Configure multer storage for captain licenses
const captainLicenseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/captainlicenses'); // Path for captain licenses
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadCaptainLicense = multer({ storage: captainLicenseStorage }).single('registration_papers');

// Upload boat license function
export const handleUploadBoatLicense = async (req, res) => {
  const { id } = req.body; // Expect dynamic ID
  const boatLicenseFile = req.file;

  console.log("ID received in handleUploadBoatLicense:", id); // Debug log

  if (!id) {
    return res.status(400).json({ message: 'Business ID or Boat ID is required' });
  }

  if (!boatLicenseFile) {
    return res.status(400).json({ message: 'No boat license file uploaded' });
  }

  try {
    const fullPath = path.resolve(boatLicenseFile.path);
    console.log("Uploading to S3 with ID:", id); // Debug log
    const boatLicensePath = await uploadToS3(fullPath, process.env.AWS_S3_BUCKET, id, 'boat-licenses');

    await fs.unlink(fullPath);

    res.status(200).json({ message: 'Boat license uploaded successfully', licensePath: boatLicensePath });
  } catch (err) {
    console.error('Error uploading boat license:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const handleRegisterCaptain = (req, res) => {
  const { first_name, last_name, experience_years, phone_number, date_of_birth, business_id } = req.body;

  // Log the received data for debugging
  console.log('Received captain registration data:', req.body);

  // Validate required fields
  if (!first_name || !last_name || !experience_years || !phone_number || !date_of_birth) {
    console.error('Captain registration error: Missing required fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Prepare data for insertion
  const captainData = {
    first_name,
    last_name,
    experience_years: parseInt(experience_years, 10),
    phone_number,
    date_of_birth,
    business_id: business_id || null,
  };

  console.log('Formatted captain data:', captainData);

  // Insert into the captains table
  Captain.createCaptain(db, captainData, (err, result) => {
    if (err) {
      console.error('Error creating captain:', err);
      return res.status(500).json({ message: 'Failed to register captain' });
    }
    res.status(201).json({ message: 'Captain registered successfully', captain_id: result.insertId });
  });
};

export const handleUploadCaptainLicense = async (req, res) => {
  const { id } = req.body; // Accept dynamic ID (business_id or captain_id)
  const captainLicenseFile = req.file;

  if (!id) {
    return res.status(400).json({ message: 'Business ID or Captain ID is required' });
  }

  if (!captainLicenseFile) {
    return res.status(400).json({ message: 'No captain license file uploaded' });
  }

  try {
    const fullPath = path.resolve(captainLicenseFile.path);
    const captainLicensePath = await uploadToS3(fullPath, process.env.AWS_S3_BUCKET, id, 'captain-licenses');

    await fs.unlink(fullPath);

    res.status(200).json({ message: 'Captain license uploaded successfully', licensePath: captainLicensePath });
  } catch (err) {
    console.error('Error uploading captain license:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// Login user (business owner or regular customer)
export const loginUser = async (req, res) => {
  console.log("loginUser controller function hit");
  console.log("Request body:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    User.findUserByEmail(db, email, async (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (results.length === 0) {
        console.log('Login failed: No user found with this email.');
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log('Login failed: Incorrect password.');
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.user_id, email: user.email, account_type: user.account_type }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } 
      );

     
      console.log('Login successful for user:', {
        id: user.user_id,
        email: user.email,
        account_type: user.account_type,
      });
      console.log('Generated Token:', token);

      res.status(200).json({
        message: 'Login successful',
        token, 
        user: { id: user.user_id, email: user.email, account_type: user.account_type },
      });
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



function mapTripTypesToDatabaseStrings(tripTypeIds) {
  // Check if tripTypeIds is already an array, if not, parse it
  if (typeof tripTypeIds === 'string') {
    try {
      tripTypeIds = JSON.parse(tripTypeIds);
    } catch (error) {
      console.error('Error parsing tripTypeIds:', error);
      return []; // Return an empty array if parsing fails
    }
  }

  if (!Array.isArray(tripTypeIds)) {
    console.error('tripTypeIds is not an array:', tripTypeIds);
    return [];
  }

  const idToStringMap = {
    1: 'short',
    2: 'day',
    3: 'sunrise', 
    4: 'overnight'
  };

  return tripTypeIds.filter(id => idToStringMap[id]).map(id => idToStringMap[id]);
}


export const registerBoat = async (req, res) => {
  const { boat_name, description, trip_types, price_per_hour, price_per_day, capacity, boat_type, location, business_id } = req.body;
  const photos = req.files;

  if (!business_id) {
    return res.status(400).json({ message: 'Business ID is required' });
  }

  if (!boat_name || !description || !trip_types || !price_per_hour || !capacity || !boat_type || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const s3Urls = [];
    for (const file of photos) {
      const fullPath = path.resolve(file.path);
      const s3Url = await uploadToS3(fullPath, process.env.AWS_S3_BUCKET, business_id, 'boat-photos');
      s3Urls.push(s3Url);

      await fs.unlink(fullPath);
    }

    const formattedTripTypes = mapTripTypesToDatabaseStrings(trip_types);

    const newBoat = {
      boat_name,
      description,
      trip_types: formattedTripTypes.join(','),
      price_per_hour,
      price_per_day: price_per_day || null,
      capacity,
      boat_type,
      location,
      business_id,
      photos: JSON.stringify(s3Urls),
      boat_license: null,
    };

    Boat.createBoat(db, newBoat, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating boat' });
      }

      res.status(201).json({ message: 'Boat registered successfully', boat: result });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};



export const getBoat = (req, res) => {
  const { business_id } = req.query;
  console.log("Business ID:", business_id);
  Boat.getBoat(db, business_id ,(err, results) => {
    if (err) {
      console.error('Error fetching boats:', err);
      return res.status(500).json({ message: 'Error fetching boats' });
    }
    console.log("Boat Results:", results);
    res.status(200).json({ boats: results });
  });
};

export const getCaptain = (req, res) => {
  const { business_id } = req.query;
  console.log("Business ID:", business_id);
  Captain.getCaptain(db,business_id ,(err, results) => {
    if (err) {
      console.error('Error fetching captains:', err);
      return res.status(500).json({ message: 'Error fetching captains' });
    }
    console.log("Captain Results:", results);
    res.status(200).json({ captains: results });
  });
};

export const getBusiness = (req, res) => {
  Business.getAllBusinesses(db, (err, results) => {
    if (err) {
      console.error('Error fetching businesses:', err);
      return res.status(500).json({ message: 'Error fetching businesses' });
    }
    res.status(200).json({ businesses: results });
  });
};

export const getUser = (req, res) => {
  User.getUser(db, 'business', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error fetching users' });
    }
    res.status(200).json({ users: results });
  });
};

export const getBoatWithID = (req, res) => {
  const { id } = req.params;
  console.log("Boat ID:", id);
  Boat.getBoatWithID(db, id, (err, result) => {
    if (err) {
      console.error('Error fetching boat:', err);
      return res.status(500).json({ message: 'Error fetching boat' });
    }
    res.status(200).json({ boat: result });
  });
}


export const getBusinessID = (req, res) => {
  const { user_id } = req.query; // Access the query parameter
  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  console.log("User ID:", user_id);
  Business.searchBusiness(db, user_id, (err, result) => {
    if (err) {
      console.error('Error fetching business ID:', err);
      return res.status(500).json({ message: 'Error fetching business ID' });
    }
      res.status(200).json({ business_id: result[0].business_id });
  });
};
