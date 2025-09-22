// controllers/taskController.js
const { run, get, all } = require('../database');

const rowToTask = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description ?? null,
  done: !!row.done,
  user_id: row.user_id ?? null,
  tags: row.tags ? String(row.tags).split(',').filter(Boolean) : undefined
});

// GET /tasks  (?user_id=&done=0|1)
exports.list = async (req, res) => {
  try {
    const cond = [], params = [];
    if (req.query.user_id) { cond.push('t.user_id = ?'); params.push(req.query.user_id); }
    if (req.query.done === '0' || req.query.done === '1') { cond.push('t.done = ?'); params.push(req.query.done); }
    const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
    const rows = await all(`
      SELECT t.*,
        (SELECT GROUP_CONCAT(tags.name, ',')
         FROM task_tags tt JOIN tags ON tags.id = tt.tag_id
         WHERE tt.task_id = t.id) AS tags
      FROM tasks t
      ${where}
      ORDER BY t.id ASC
    `, params);
    res.json(rows.map(rowToTask));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /tasks/:id
exports.getOne = async (req, res) => {
  try {
    const row = await get(`
      SELECT t.*,
        (SELECT GROUP_CONCAT(tags.name, ',')
         FROM task_tags tt JOIN tags ON tags.id = tt.tag_id
         WHERE tt.task_id = t.id) AS tags
      FROM tasks t
      WHERE t.id = ?
      LIMIT 1
    `, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(rowToTask(row));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /tasks  {title, description?, user_id?, tags?:[]}
exports.create = async (req, res) => {
  try {
    const { title, description, user_id, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'title es obligatorio' });
    const r = await run(
      `INSERT INTO tasks (title, description, user_id) VALUES (?,?,?)`,
      [title, description ?? null, user_id ?? null]
    );
    const taskId = r.lastID;

    if (Array.isArray(tags) && tags.length) {
      for (const name of tags) {
        await run(`INSERT OR IGNORE INTO tags(name) VALUES (?)`, [name]);
        const tagRow = await get(`SELECT id FROM tags WHERE name = ?`, [name]);
        await run(`INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?,?)`, [taskId, tagRow.id]);
      }
    }
    const row = await get(`
      SELECT t.*,
        (SELECT GROUP_CONCAT(tags.name, ',')
         FROM task_tags tt JOIN tags ON tags.id = tt.tag_id
         WHERE tt.task_id = t.id) AS tags
      FROM tasks t WHERE t.id = ?
    `, [taskId]);
    res.status(201).set('Location', `/tasks/${taskId}`).json(rowToTask(row));
  } catch (e) { res.status(500).json({ error: e.message }); }
};
