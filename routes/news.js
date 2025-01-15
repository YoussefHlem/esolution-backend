const express = require('express');
const xss = require('xss');

const router = express.Router();
const News = require('../models/News');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const moment = require('moment');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/news/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get All News
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Latest News
router.get('/latest', async (req, res) => {
  try {
    const news = await News.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title description createdAt id');

    const formattedNews = news.map(item => ({
      ...item.toObject(),
      createdFrom: moment(item.createdAt).fromNow()
    }));

    res.json(formattedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single News
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create News (Admin Only)
router.post('/', [authMiddleware, adminMiddleware, upload.single('image')], async (req, res) => {
  try {
    const { title, description, body } = req.body;
    const sanitizedBody = xss(body);  // Sanitize the body

    const news = new News({
      title,
      description,
      body: sanitizedBody,
      image: req.file ? req.file.path : '',
      createdFrom: new Date()
    });

    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update News (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware, upload.single('image')], async (req, res) => {
  try {
    const { title, description, body } = req.body;
    const sanitizedBody = xss(body);  // Sanitize the body

    const updateData = { title, description, body: sanitizedBody };
    if (req.file) {
      updateData.image = req.file.path;
    }

    const news = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete News (Admin Only)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
