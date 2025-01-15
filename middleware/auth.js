const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userId !== 'admin') {
      throw new Error();
    }

    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(403).send({ error: 'Admin access required.' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
