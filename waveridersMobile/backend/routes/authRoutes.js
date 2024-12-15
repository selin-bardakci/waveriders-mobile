import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  handleUploadBoatLicense,
  handleUploadCaptainLicense,
  accountSetup,
  registerBusiness,
  registerUser,
  loginUser,
  handleRegisterCaptain,
  registerBoat,
  getBoat,
  getCaptain,
  getBusiness,
  getUser,
  getBusinessID,
  getBoatWithID
} from '../controllers/authController.js';

const router = express.Router();

// File upload configurations
const captainLicenseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/captainlicenses');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const uploadCaptainLicense = multer({ storage: captainLicenseStorage }).single('registration_papers');

const boatLicenseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/boatlicenses');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const boatLicense = multer({ storage: boatLicenseStorage }).single('license');

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/photos');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: photoStorage });

// Routes
router.post('/account-setup', accountSetup);
router.post('/signup', registerUser);
router.post('/registerBusiness', registerBusiness);
router.post('/registerCaptain', upload.none(), handleRegisterCaptain);

// **Add File Upload Routes Here**
router.post('/captainLicense', uploadCaptainLicense, handleUploadCaptainLicense);
router.post('/boatLicense', boatLicense, handleUploadBoatLicense);
router.post('/registerBoat', upload.array('photos', 10), registerBoat);

// Data Retrieval Routes
router.get('/boat' , getBoat);
router.get('/business', getBusiness);
router.get('/captain', getCaptain);
router.get('/user', getUser);
router.get('/businessID', getBusinessID);
router.get('/boat/:id', getBoatWithID);
// Login route
router.post('/login', loginUser);

export default router;
