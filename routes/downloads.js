const express = require('express');
const router = express.Router();
const Download = require('../models/Download');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/downloads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get All Downloads
router.get('/', [authMiddleware], async (req, res) => {
  try {
    const downloads = await Download.find();
    res.json(downloads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get One Download
router.get('/:id', [authMiddleware], async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);

    if (!download) {
      return res.status(404).json({ message: 'Download not found' });
    }

    res.json(download);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Download (Admin Only)
router.post('/', [authMiddleware, adminMiddleware, upload.single('pdf')], async (req, res) => {
  try {
    const { title, description } = req.body;
    const download = new Download({
      title,
      description,
      pdfAttachment: req.file ? req.file.path : ''
    });
    await download.save();
    res.status(201).json(download);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Download (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware, upload.single('pdf')], async (req, res) => {
  try {
    const { title, description } = req.body;
    const updateData = { title, description };

    if (req.file) {
      updateData.pdfAttachment = req.file.path;
    }

    const download = await Download.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!download) {
      return res.status(404).json({ message: 'Download not found' });
    }

    res.json(download);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Download (Admin Only)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const download = await Download.findByIdAndDelete(req.params.id);

    if (!download) {
      return res.status(404).json({ message: 'Download not found' });
    }

    res.json({ message: 'Download deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
