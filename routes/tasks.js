const router = require('express').Router();
const c = require ('../controllers/taskController');

// "localhost:3000/api/v1/tasks/"
router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);

module.exports = router;