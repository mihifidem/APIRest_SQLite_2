const router = require('express').Router();
const c = require ('../controllers/userController');

// "localhost:3000/api/v1/users/"
router.get('/', c.list);
router.post('/add',c.create)


module.exports = router;