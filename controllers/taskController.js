const { run, get, all } = require('../database');

const rowToTask = (row) => ({
    id: row.id,
    title: row.id,
    description: row.description ?? null,
    done: !!row.done,
    user_id: row.user_id ?? null,
    tags: row.tags ? String(row.tags).split(',').filter(Boolean) : undefined
});

// GET /tasks (?user_id=5&done=0)
exports.list = async (req, res) => {
    try {
        const cond = [], params = [];
        if (req.query.user_id) {
            (cond.push('t.user_id = ?'));
            params.push(req.query.user_id);
        }
        if (req.query.done === '0' || req.query.done === '1') {
            cond.push('t.done = ?');
            params.push(req.query.done);
        }
    
        const where = cond.length ? `where ${cond.join(' and ')}` :'';
        const rows = await all(`
                select t.*,
                (select group_concat(tags.name,',')
                from task_tags tt 
                join tags 
                on tags.id = tt.tag_id
                where tt.task_id = t.id) as tags
                from tasks t
                ${where}
                order by t.id asc
                `, params);
        res.json(rows.map(rowToTask));

    } catch (e) { res.status(500).json({ error: e.message }); }
};