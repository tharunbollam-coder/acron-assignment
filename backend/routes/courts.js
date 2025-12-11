const express = require('express');
const router = express.Router();
const Court = require('../models/Court');

// GET all courts
router.get('/', async (req, res) => {
  try {
    const { sport, type, active } = req.query;
    let filter = {};
    
    if (sport) filter.sport = sport;
    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';
    
    const courts = await Court.find(filter).sort({ name: 1 });
    res.json(courts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single court
router.get('/:id', async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    res.json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new court (admin)
router.post('/', async (req, res) => {
  try {
    const court = new Court(req.body);
    const savedCourt = await court.save();
    res.status(201).json(savedCourt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update court (admin)
router.put('/:id', async (req, res) => {
  try {
    const court = await Court.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    res.json(court);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE court (admin)
router.delete('/:id', async (req, res) => {
  try {
    const court = await Court.findByIdAndDelete(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    res.json({ message: 'Court deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
