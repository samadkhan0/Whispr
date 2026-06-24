const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { run, get, makeId } = require('../db');

const SECRET      = process.env.JWT_SECRET || 'whispr_dev_secret';
const createToken = (userId) => jwt.sign({ userId }, SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    console.log('Register attempt:', { username, email });

    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required.' });

    const existingUser  = get('SELECT id FROM users WHERE username = ?', [username.toLowerCase()]);
    const existingEmail = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);

    console.log('existing user:', existingUser);
    console.log('existing email:', existingEmail);

    if (existingUser)  return res.status(400).json({ error: 'Username already taken.' });
    if (existingEmail) return res.status(400).json({ error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const id = makeId();

    run(
      'INSERT INTO users (id, username, email, password, displayName) VALUES (?,?,?,?,?)',
      [id, username.toLowerCase(), email.toLowerCase(), hashed, displayName || username]
    );

    const user  = get('SELECT id, username, email, displayName FROM users WHERE id = ?', [id]);
    const token = createToken(id);
    res.status(201).json({ token, user });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required.' });

    const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = createToken(user.id);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;