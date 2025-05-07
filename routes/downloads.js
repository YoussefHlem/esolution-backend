const express = require('express');
const router = express.Router();
const Download = require('../models/Download');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {uploadMiddleware, getFileByName} = require("../utils/upload");

require('dotenv').config();


// Get All Downloads
router.get('/', async (req, res) => {
  try {
    const downloads = await Download.find();
    res.json(downloads);
  } catch (error) {
    res.status(500).json({ message: error.message + "test" });
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
router.post('/', [authMiddleware, adminMiddleware, uploadMiddleware('pdf')], async (req, res) => {
  try {
    const { title, description, tag } = req.body;

      const pdfUrl = req.filename ? `${process.env.URL}/downloads/file/${req.filename}` : '';

    const download = new Download({
      title,
      description,
      tag,
      pdfAttachment: req.file ? pdfUrl : ''
    });
    await download.save();
    res.status(201).json(download);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/file/:filename', async (req, res) => {
    try {
        const file = await getFileByName(req.params.filename);
        res.send(file);
    } catch (error) {
        res.status(404).json({ message: 'File not found' });
    }
});
// Update Download (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware, uploadMiddleware('pdf')], async (req, res) => {
  try {
      const { title, description, tag } = req.body;
      const updateData = { title, description, tag };

      if (req.file) {
          updateData.pdfAttachment = req.filename ? `${process.env.URL}/downloads/file/${req.filename}` : '';
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
