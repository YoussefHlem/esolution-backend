const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check credentials against environment variables
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ userId: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
      // wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      return res.json({ token, role: 'admin' });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
