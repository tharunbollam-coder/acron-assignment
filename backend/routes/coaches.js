const express = require('express');
const router = express.Router();
const Coach = require('../models/Coach');

// GET all coaches
router.get('/', async (req, res) => {
  try {
    const { sport, active } = req.query;
    let filter = {};
    
    if (sport) filter.specializations = sport;
    if (active !== undefined) filter.isActive = active === 'true';
    
    const coaches = await Coach.find(filter).sort({ name: 1 });
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single coach
router.get('/:id', async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json(coach);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new coach (admin)
router.post('/', async (req, res) => {
  try {
    const coach = new Coach(req.body);
    const savedCoach = await coach.save();
    res.status(201).json(savedCoach);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update coach (admin)
router.put('/:id', async (req, res) => {
  try {
    const coach = await Coach.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json(coach);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE coach (admin)
router.delete('/:id', async (req, res) => {
  try {
    const coach = await Coach.findByIdAndDelete(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
