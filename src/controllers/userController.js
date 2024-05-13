// Importing required models and libraries
require('dotenv').config;
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Setting the number of salt rounds for password hashing
const saltRounds = 10;

// Controller function to handle user registration
exports.userRegister = async (req, res) => {
    try {
        // Creating a new user instance with the request body
        let newUser = new User(req.body);
        let userPwd = newUser.password;

        // Generating a salt and hashing the user's password
        let salt = await bcrypt.genSalt(saltRounds);
        let hash = await bcrypt.hash(userPwd, salt);

        // Updating the user's password with the hashed version
        newUser.password = hash;

        // Saving the user to the database
        let user = await newUser.save();
        res.status(201).json({ message: `User created: ${user.email}` });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid request' });
    }
};

// Controller function to handle user login
exports.userLogin = async (req, res) => {
    try {
        // Finding the user by email in the database
        const user = await User.findOne({ email: req.body.email });

        // Handling the case where the user is not found
        if (!user) {
            res.status(500).json({ message: 'User not found' });
            return;
        }

        // Comparing the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        // Handling successful login
        if (passwordMatch) {
            // Creating a JWT token containing user information
            const userData = {
                id: user._id,
                email: user.email,
                name: user.name
            };
            
            // Signing the JWT token with the secret key and setting an expiration time
            const token = await jwt.sign(userData, process.env.JWT_KEY, { expiresIn: '10h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: 'Incorrect email or password.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during processing.' });
    }
};

// Controller function to delete a user
exports.deleteAUser = async (req,res) => {
    try {
        // Deleting a user based on the provided user ID
        await User.findByIdAndDelete(req.params.id_users);
        res.status(202);
        res.json({message: "User deleted"});
    } catch (error) {
        res.status(500);
        res.json({message: "Server error."});
    }
};

// Controller function to update a user's information
exports.updateAUser = async (req, res) => {
    try {
        const userUpdate = req.body;

        // Hashing the new password if present in the update
        if (userUpdate.password) {
            const salt = await bcrypt.genSalt(10);
            userUpdate.password = await bcrypt.hash(userUpdate.password, salt);
        }

        // Updating the user in the database
        const user = await User.findByIdAndUpdate(
            req.params.id_users,
            { $set: userUpdate },
            { new: true } // Returning the modified document
        );

        // Handling the case where the user is not found
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(203).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Controller function to list all users
exports.listAllUsers = async (req,res) => {
    try {
        // Retrieving all users from the database
        const users = await User.find({});
        res.status(200);
        res.json(users);
    } catch (error) {
        res.status(500);
        console.log(error);
        res.json({message: "Server error."});
    }
};
