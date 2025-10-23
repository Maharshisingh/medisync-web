// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.user) {
        req.user = decoded.user;
      } else if (decoded.pharmacy) {
        req.pharmacy = decoded.pharmacy;
      }

      next();
    } catch (error) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };