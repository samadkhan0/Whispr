const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { initDB } = require('./db');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/secrets', require('./routes/secrets'));
app.use('/api/tells',   require('./routes/tells'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Whispr server is running 👻' });
});

const PORT = process.env.PORT || 5000;

// Init database first, then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start:', err);
});
