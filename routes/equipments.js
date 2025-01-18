const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const URL = process.env.URL;

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/equipments/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get All Equipments
router.get('/', async (req, res) => {
  try {
    const equipments = await Equipment.find();
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get One Equipment
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

// Create Equipment (Admin Only)
router.post('/', [authMiddleware, adminMiddleware, upload.single('image')], async (req, res) => {
  try {
    const { title, description, qty } = req.body;
    const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : '';
    const imageUrl = `${URL || "http://localhost:5000"}/${imagePath}`;

    const equipment = new Equipment({
      title,
      description,
      image: req.file ? imageUrl : '',
      qty: parseInt(qty)
    });
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Equipment (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware, upload.single('image')], async (req, res) => {
  try {
      const { title, description, qty } = req.body;
      const updateData = {
          title,
          description,
          qty: parseInt(qty, 10), // Ensure quantity is stored as an integer
      };

      if (req.file) {
          const imagePath = req.file.path.replace(/\\/g, '/'); // Normalize path
          const imageUrl = `${process.env.URL || "http://localhost:5000"}/${imagePath}`; // Construct URL
          updateData.image = imageUrl;
      }

      const equipment = await Equipment.findByIdAndUpdate(req.params.id, updateData, { new: true });

      if (!equipment) {
          return res.status(404).json({ message: 'Equipment not found' });
      }

      res.json(equipment);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});


// Delete Equipment (Admin Only)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
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
