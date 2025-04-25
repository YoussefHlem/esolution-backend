const express = require('express');
const xss = require('xss');

const router = express.Router();
const Blog = require('../models/Blog');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const moment = require('moment');
const {uploadMiddleware, getFileByName} = require("../utils/upload");

require('dotenv').config();

// Get All Blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
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

// Get Latest Blogs
router.get('/latest', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title description createdAt id');

    const formattedBlogs = blogs.map(item => ({
      ...item.toObject(),
      createdFrom: moment(item.createdAt).fromNow()
    }));

    res.json(formattedBlogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Blog (Admin Only)
router.post('/', [authMiddleware, adminMiddleware, uploadMiddleware('image')], async (req, res) => {
  try {
    const { title, description, body } = req.body;
    const sanitizedBody = xss(body);  // Sanitize the body

    const imageUrl = req.filename ? `${process.env.URL}/blogs/file/${req.filename}` : '';

    const blog = new Blog({
      title,
      description,
      body: sanitizedBody,
      image: req.file ? imageUrl : '',
      createdFrom: new Date()
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Blog (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware, uploadMiddleware('image')], async (req, res) => {
  try {
      const { title, description, body } = req.body;
      const sanitizedBody = xss(body); // Sanitize the body

      const updateData = { title, description, body: sanitizedBody };

      if (req.file) {
          updateData.image = req.filename ? `${process.env.URL}/blogs/file/${req.filename}` : '';
      }

      const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

      if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
      }

      res.json(blog);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});

// Delete Blog (Admin Only)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;