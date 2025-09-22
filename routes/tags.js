const router = require('express').Router();
const c = require ('../controllers/tagController');

// "localhost:3000/api/v1/tags/"
router.get('/', c.list);
router.post('/add',c.create)


module.exports = router;