const router = require('express').Router();
const auth   = require('../middleware/auth');
const { run, get, all, makeId } = require('../db');

// GET inbox — must be defined before /:username
router.get('/inbox', auth, (req, res) => {
  try {
    const tells = all(
      'SELECT id, text, isRead, createdAt FROM tells WHERE recipientId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json({ tells });
  } catch (err) {
    console.error('INBOX ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST send anonymous tell
router.post('/:username', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ error: 'Message cannot be empty.' });
    if (text.length > 500)
      return res.status(400).json({ error: 'Max 500 characters.' });

    const username  = req.params.username.toLowerCase();
    console.log('Sending tell to username:', username);

    const recipient = get('SELECT id FROM users WHERE username = ?', [username]);
    console.log('Recipient found:', recipient);

    if (!recipient || recipient.id === undefined)
      return res.status(404).json({ error: 'User not found.' });

    run('INSERT INTO tells (id, text, recipientId) VALUES (?,?,?)',
      [makeId(), text.trim(), recipient.id]);
    run('UPDATE users SET tellCount = tellCount + 1 WHERE id = ?', [recipient.id]);

    res.status(201).json({ message: "Tell sent! 👻" });
  } catch (err) {
    console.error('SEND TELL ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark as read
router.patch('/:id/read', auth, (req, res) => {
  try {
    const tell = get('SELECT id FROM tells WHERE id = ? AND recipientId = ?',
      [req.params.id, req.user.id]);
    if (!tell || tell.id === undefined)
      return res.status(404).json({ error: 'Tell not found.' });
    run('UPDATE tells SET isRead = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE tell
router.delete('/:id', auth, (req, res) => {
  try {
    const tell = get('SELECT id FROM tells WHERE id = ? AND recipientId = ?',
      [req.params.id, req.user.id]);
    if (!tell || tell.id === undefined)
      return res.status(404).json({ error: 'Tell not found.' });
    run('DELETE FROM tells WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;