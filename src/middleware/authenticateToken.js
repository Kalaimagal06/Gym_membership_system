// src/middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

function extractToken(req) {
  // Prefer Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  // Fallback to cookie named 'token'
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

function authenticateToken(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // { id, email, iat, exp }
    next();
  });
}

module.exports = { authenticateToken };
