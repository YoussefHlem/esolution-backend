const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {uploadMiddleware, getFileByName} = require("../utils/upload");


require('dotenv').config();



// Get All Projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get One Project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Project (Admin Only)
router.post('/', [authMiddleware, adminMiddleware, uploadMiddleware('image')], async (req, res) => {
  try {
    const { title, description } = req.body;
      const imageUrl = req.filename ? `${process.env.URL}/projects/file/${req.filename}` : '';

    
    const project = new Project({
      title,
      description,
      image: imageUrl
    });
    await project.save();
    res.status(201).json(project);
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
// Update Project (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware, uploadMiddleware('image')], async (req, res) => {
  try {
      const { title, description } = req.body;
      const updateData = { title, description };

      if (req.file) {
          updateData.image = req.filename ? `${process.env.URL}/projects/file/${req.filename}` : '';
      }

      const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });

      if (!project) {
          return res.status(404).json({ message: 'Project not found' });
      }

      res.json(project);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});


// Delete Project (Admin Only)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
