// src/routes/members.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');

const router = express.Router();

// GET all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET a single member
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create member
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('age').isInt({ min: 1 }).withMessage('Valid age required'),
    body('membership_type').notEmpty().withMessage('Membership type required'),
    body('start_date').isDate().withMessage('Valid start date required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const member = await Member.create(req.body);
      res.status(201).json(member);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT update member
router.put(
  '/:id',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('age').isInt({ min: 1 }).withMessage('Valid age required'),
    body('membership_type').notEmpty().withMessage('Membership type required'),
    body('start_date').isDate().withMessage('Valid start date required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const existing = await Member.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Member not found' });
      const updated = await Member.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    const existing = await Member.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Member not found' });
    await Member.delete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
