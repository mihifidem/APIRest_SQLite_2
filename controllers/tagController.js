const { run, get, all } = require('../database');

exports.list = async (req, res) => {
  try {
    const rows = await all(`SELECT * from tags group by name`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name es obligatorio' });
    const r = await run(
      `INSERT INTO tags (name) VALUES (?)`,
      [name]
    );
  } catch (e) { res.status(500).json({ error: e.message }); }
};
