import { connectDB } from '../config/db.js';
import { User } from '../models/userModel.js';
import { Business } from '../models/businessModel.js';
const db = connectDB();

export const getUserProfile = (req, res) => {
    const { id } = req.user;
    
    User.findUserById(db, id, (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Error fetching user.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = results[0];
        res.status(200).json({
            id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            account_type: user.account_type,
        });
        console.log('User profile fetched successfully.');
    });
};

export const getBusinessProfile = (req, res) => {
    const { id } = req.user;
    
    Business.findBusinessByUserId(db, id, (err, results) => {
        if (err) {
            console.error('Error fetching business:', err);
            return res.status(500).json({ message: 'Error fetching business.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Business not found.' });
        }

        const business = results[0];
        res.status(200).json({
            id: business.user_id,
            email: business.email,
            business_name: business.business_name,
            account_type: business.account_type,
        });
        console.log('Business profile fetched successfully.');
    });
}

export const updateUserProfile = (req, res) => {
    const { id } = req.user; 
    const { first_name, last_name, phone_number, date_of_birth } = req.body;

    
    const updateData = { first_name, last_name, phone_number, date_of_birth };

    User.updateUser(db, id, updateData, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Error updating user profile.' });
        }

        res.status(200).json({ message: 'User profile updated successfully.' });
    });
};
