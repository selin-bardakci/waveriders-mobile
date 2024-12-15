import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("Authorization Header:", authHeader); 

  if (!authHeader) {
    console.log("Authorization header not provided");
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  console.log("Extracted Token:", token);

  if (!token) {
    console.log("Token not found in authorization header");
    return res.status(401).json({ message: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log("Decoded Token:", decoded); 
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message); 

    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    } else {
      return res.status(403).json({ message: 'Invalid token' });
    }
  }
};
