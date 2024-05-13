// Importing necessary libraries and modules
const jwt = require('jsonwebtoken');
const jws = require('jws');
require('dotenv').config();
const jwtKey = process.env.JWT_KEY;

// Middleware function to verify the user's JWT token
exports.verifyToken = async (req, res, next) => {
    try {
        // Extracting the token from the request headers
        const token = req.headers['authorization'];

        // Checking if the token is present
        if (token !== undefined) {
            // Verifying the token using the JWT library
            const payload = await new Promise((resolve, reject) => {
                jwt.verify(token, jwtKey, (error, decoded) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(decoded);
                    }
                });
            });

            // Assigning the decoded payload to the request object
            req.user = payload;
            next();
        } else {
            // Handling the case where the token is missing
            res.status(403).json({ message: "Access denied: Missing token" });
        }
    } catch {
        // Handling the case where the token is invalid
        res.status(403).json({ message: "Access denied: Invalid token" });
    }
};

// Function to decode a JWT token using the 'jws' library
exports.decode = function (jwt, options) {
    options = options || {};
    var decoded = jws.decode(jwt, options);
    if (!decoded) { return null; }
    var payload = decoded.payload;

    return payload;
};

// Middleware function to verify an invitation token
exports.verifyTokenInvitation = async (req, res, next) => {
    try {
        // Extracting the invitation token from the request headers
        const token = req.headers['invitation'];

        // Checking if the invitation token is present
        if (token !== undefined) {
            // Verifying the invitation token using the JWT library
            const payload = await new Promise((resolve, reject) => {
                jwt.verify(token, jwtKey, (error, decoded) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(decoded);
                    }
                });
            });

            // Assigning the decoded payload to the request object
            req.user = payload;
            next();
        } else {
            // Handling the case where the invitation token is missing
            res.status(403).json({ message: "Access denied: Missing invitation token" });
        }
    } catch {
        // Handling the case where the invitation token is invalid
        res.status(403).json({ message: "Access denied: Invalid invitation token" });
    }
};
