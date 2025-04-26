const express = require('express');
const xss = require('xss');

const router = express.Router();
const News = require('../models/News');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const moment = require('moment');
const {uploadMiddleware, getFileByName} = require("../utils/upload");

require('dotenv').config();

// Get All News
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdFrom: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
// Get Latest News
router.get('/latest', async (req, res) => {
  try {
    const news = await News.find()
      .sort({ createdFrom: -1 })
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
router.post('/', [authMiddleware, adminMiddleware, uploadMiddleware('image')], async (req, res) => {
  try {
    const { title, description, body, createdFrom } = req.body;
    const sanitizedBody = xss(body);  // Sanitize the body

      const imageUrl = req.filename ? `${process.env.URL}/news/file/${req.filename}` : '';

    // Validate createdFrom if provided
    let createdFromDate = new Date();
    if (createdFrom) {
      const parsedDate = new Date(createdFrom);
      if (!isNaN(parsedDate.getTime())) {
        createdFromDate = parsedDate;
      }
    }

    const news = new News({
      title,
      description,
      body: sanitizedBody,
      image: req.file ? imageUrl : '',
      createdFrom: createdFromDate
    });

    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update News (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware, uploadMiddleware('image')], async (req, res) => {
  try {
      const { title, description, body, createdFrom } = req.body;
      const sanitizedBody = xss(body); // Sanitize the body

      // Validate createdFrom if provided
      let createdFromDate = new Date();
      if (createdFrom) {
        const parsedDate = new Date(createdFrom);
        if (!isNaN(parsedDate.getTime())) {
          createdFromDate = parsedDate;
        }
      }

      const updateData = { 
          title, 
          description, 
          body: sanitizedBody,
          createdFrom: createdFromDate
      };

      if (req.file) {
          updateData.image = req.filename ? `${process.env.URL}/news/file/${req.filename}` : '';
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
