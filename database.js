// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'database.db'));

// Helpers promesa (facilitan controllers)
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
  
const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });


const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

db.serialize(() => {
  // ¡Necesario para que funcionen las foreign keys!
  db.run('PRAGMA foreign_keys = ON');

  // USERS (lado 1)
  db.run(`
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE
    );
  `);

  // PROFILES (1–1 con users): misma PK y FK
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles(
      user_id INTEGER PRIMARY KEY,
      bio TEXT,
      avatar TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // TASKS (1–N: user → tasks)
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      done INTEGER DEFAULT 0 CHECK (done IN (0,1)),
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // TAGS (catálogo)
  db.run(`
    CREATE TABLE IF NOT EXISTS tags(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // TASK_TAGS (N–N: tasks ↔ tags)
  db.run(`
    CREATE TABLE IF NOT EXISTS task_tags(
      task_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  // Índices útiles
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_task_tags_task ON task_tags(task_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag_id);`);
});

module.exports = { db, run, get, all };
