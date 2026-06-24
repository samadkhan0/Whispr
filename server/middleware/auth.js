const jwt    = require('jsonwebtoken');
const { get } = require('../db');

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token. Please log in.' });

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'whispr_dev_secret');

    const user = get(
      'SELECT id, username, email, displayName, bio, secretCount, tellCount, createdAt FROM users WHERE id = ?',
      [decoded.userId]
    );
    if (!user) return res.status(401).json({ error: 'User not found.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
