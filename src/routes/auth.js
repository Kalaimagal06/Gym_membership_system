// src/routes/auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const user = await User.create({ email, password });
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      // Send token in HttpOnly cookie
      res
        .cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' })
        .status(201)
        .json({ message: 'User created', token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [body('email').isEmail(), body('password').exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'User not found. Please register an account first.' });
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(400).json({ message: 'Incorrect password.' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res
        .cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' })
        .json({ message: 'Logged in', token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get current user (protected example)
router.get('/me', require('../middleware/authenticateToken').authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
