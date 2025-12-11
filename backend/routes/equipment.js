const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');

// GET all equipment
router.get('/', async (req, res) => {
  try {
    const { sport, type, active } = req.query;
    let filter = {};
    
    if (sport) filter.sport = sport;
    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';
    
    const equipment = await Equipment.find(filter).sort({ name: 1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single equipment
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new equipment (admin)
router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    // Set available stock equal to total stock for new equipment
    if (equipment.totalStock && !equipment.availableStock) {
      equipment.availableStock = equipment.totalStock;
    }
    const savedEquipment = await equipment.save();
    res.status(201).json(savedEquipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update equipment (admin)
router.put('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE equipment (admin)
router.delete('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
