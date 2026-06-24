const router = require('express').Router();
const auth   = require('../middleware/auth');
const { run, get, all, makeId } = require('../db');

const VALID_EMOJIS = ['🔥', '💀', '👀', '🌙', '✨', '🫣'];

// ── GET /api/secrets ────────────────────────────────────────
router.get('/', auth, (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const rows = all(
    'SELECT id, text, reactions, reactedBy, createdAt FROM secrets ORDER BY createdAt DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  const secrets = rows.map(s => {
    const reactedBy = JSON.parse(s.reactedBy || '[]');
    const mine      = reactedBy.find(r => r.userId === req.user.id);
    return {
      id:         s.id,
      text:       s.text,
      reactions:  JSON.parse(s.reactions || '{}'),
      myReaction: mine ? mine.emoji : null,
      createdAt:  s.createdAt,
    };
  });

  res.json({ secrets, page, limit });
});

// ── POST /api/secrets ───────────────────────────────────────
router.post('/', auth, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required.' });
  if (text.length > 280)     return res.status(400).json({ error: 'Max 280 characters.' });

  const id = makeId();
  run('INSERT INTO secrets (id, text, authorId) VALUES (?,?,?)', [id, text.trim(), req.user.id]);
  run('UPDATE users SET secretCount = secretCount + 1 WHERE id = ?', [req.user.id]);

  res.status(201).json({
    secret: { id, text: text.trim(), reactions: {}, myReaction: null, createdAt: new Date().toISOString() }
  });
});

// ── POST /api/secrets/:id/react ─────────────────────────────
router.post('/:id/react', auth, (req, res) => {
  const { emoji } = req.body;
  if (!VALID_EMOJIS.includes(emoji)) return res.status(400).json({ error: 'Invalid emoji.' });

  const secret = get('SELECT * FROM secrets WHERE id = ?', [req.params.id]);
  if (!secret) return res.status(404).json({ error: 'Secret not found.' });

  const reactions = JSON.parse(secret.reactions || '{}');
  const reactedBy = JSON.parse(secret.reactedBy || '[]');
  const userId    = req.user.id;
  const existing  = reactedBy.find(r => r.userId === userId);

  if (existing && existing.emoji === emoji) {
    // Toggle off
    reactions[emoji] = (reactions[emoji] || 1) - 1;
    if (reactions[emoji] <= 0) delete reactions[emoji];
    const newReactedBy = reactedBy.filter(r => r.userId !== userId);
    run('UPDATE secrets SET reactions=?, reactedBy=? WHERE id=?',
      [JSON.stringify(reactions), JSON.stringify(newReactedBy), secret.id]);
    return res.json({ reactions, myReaction: null });
  }

  if (existing) {
    reactions[existing.emoji] = (reactions[existing.emoji] || 1) - 1;
    if (reactions[existing.emoji] <= 0) delete reactions[existing.emoji];
    reactedBy.splice(reactedBy.findIndex(r => r.userId === userId), 1);
  }

  reactions[emoji] = (reactions[emoji] || 0) + 1;
  reactedBy.push({ userId, emoji });

  run('UPDATE secrets SET reactions=?, reactedBy=? WHERE id=?',
    [JSON.stringify(reactions), JSON.stringify(reactedBy), secret.id]);

  res.json({ reactions, myReaction: emoji });
});

// ── DELETE /api/secrets/:id ─────────────────────────────────
router.delete('/:id', auth, (req, res) => {
  const secret = get('SELECT * FROM secrets WHERE id = ?', [req.params.id]);
  if (!secret)                          return res.status(404).json({ error: 'Not found.' });
  if (secret.authorId !== req.user.id)  return res.status(403).json({ error: 'Not allowed.' });

  run('DELETE FROM secrets WHERE id = ?', [req.params.id]);
  run('UPDATE users SET secretCount = MAX(0, secretCount - 1) WHERE id = ?', [req.user.id]);
  res.json({ message: 'Deleted.' });
});

module.exports = router;
