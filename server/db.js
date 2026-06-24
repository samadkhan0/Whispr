// db.js — SQLite via sql.js (pure JavaScript, no compilation needed!)
// Data is saved to whispr.db file on your computer

const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

const DB_FILE = path.join(__dirname, 'whispr.db');

let db; // will hold our database instance

async function initDB() {
  const SQL = await initSqlJs();

  // Load existing database file OR create a new one
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Loaded existing whispr.db');
  } else {
    db = new SQL.Database();
    console.log('✅ Created new whispr.db');
  }

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      username    TEXT UNIQUE NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      displayName TEXT DEFAULT '',
      bio         TEXT DEFAULT '',
      secretCount INTEGER DEFAULT 0,
      tellCount   INTEGER DEFAULT 0,
      createdAt   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS secrets (
      id        TEXT PRIMARY KEY,
      text      TEXT NOT NULL,
      authorId  TEXT NOT NULL,
      reactions TEXT DEFAULT '{}',
      reactedBy TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tells (
      id          TEXT PRIMARY KEY,
      text        TEXT NOT NULL,
      recipientId TEXT NOT NULL,
      isRead      INTEGER DEFAULT 0,
      createdAt   TEXT DEFAULT (datetime('now'))
    );
  `);

  save(); // save initial structure
  console.log('✅ Database tables ready');
}

// Save database to disk — call this after every write operation
function save() {
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

// Run a write query (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
  db.run(sql, params);
  save();
}

function get(sql, params = []) {
  const stmt   = db.prepare(sql);
  const result = stmt.getAsObject(params);
  stmt.free();
  if (!result || Object.values(result).every(v => v === undefined || v === null)) {
    return undefined;
  }
  return result;
}
// Get multiple rows
function all(sql, params = []) {
  const stmt    = db.prepare(sql);
  const rows    = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// Simple ID generator
function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

module.exports = { initDB, run, get, all, makeId };
