const express = require('express');
const router = express.Router();
const PricingRule = require('../models/PricingRule');

// GET all pricing rules
router.get('/', async (req, res) => {
  try {
    const { active, type } = req.query;
    let filter = {};
    
    if (active !== undefined) filter.isActive = active === 'true';
    if (type) filter.type = type;
    
    const rules = await PricingRule.find(filter).sort({ priority: 1, name: 1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single pricing rule
router.get('/:id', async (req, res) => {
  try {
    const rule = await PricingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new pricing rule (admin)
router.post('/', async (req, res) => {
  try {
    const rule = new PricingRule(req.body);
    const savedRule = await rule.save();
    res.status(201).json(savedRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update pricing rule (admin)
router.put('/:id', async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }
    res.json(rule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE pricing rule (admin)
router.delete('/:id', async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }
    res.json({ message: 'Pricing rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
