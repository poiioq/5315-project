// authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Function to generate a JWT token
function generateToken(userId) {
  return jwt.sign({ id: userId }, jwtSecretKey, { expiresIn: '1h' });
}

// Function to verify a JWT token
function verifyToken(token) {
  return jwt.verify(token, jwtSecretKey);
}

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from Bearer

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
}

module.exports = { generateToken, authenticateToken };
