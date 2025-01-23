const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { uploadMiddleware, getFileByName } = require('../utils/upload');

router.get('/', async (req, res) => {
    try {
        const equipments = await Equipment.find();
        res.json(equipments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
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

router.post('/', [authMiddleware, adminMiddleware, uploadMiddleware('image')], async (req, res) => {
    try {
        const { title, description, qty } = req.body;
        const imageUrl = req.filename ? `${process.env.URL}/equipments/file/${req.filename}` : '';

        const equipment = new Equipment({
            title,
            description,
            image: imageUrl,
            qty: parseInt(qty)
        });
        await equipment.save();
        res.status(201).json(equipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', [authMiddleware, adminMiddleware, uploadMiddleware('image')], async (req, res) => {
    try {
        const { title, description, qty } = req.body;
        const updateData = {
            title,
            description,
            qty: parseInt(qty, 10)
        };

        if (req.filename) {
            updateData.image = `${process.env.URL}/equipments/file/${req.filename}`;
        }

        const equipment = await Equipment.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndDelete(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;