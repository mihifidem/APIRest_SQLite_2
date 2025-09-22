const { run, get, all } = require('../database');

// GET /users
exports.list = async (req, res) => {
  try {
    const rows = await all(`SELECT * from users order by name`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, email} = req.body;
    if (!name) return res.status(400).json({ error: 'name es obligatorio' });
    const r = await run(
      `INSERT INTO users (name, email) VALUES (?,?)`,
      [name, email ?? null]
    );
  } catch (e) { res.status(500).json({ error: e.message }); }
};
