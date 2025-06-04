const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { submitCheck } = require('../controllers/checkController');

router.post('/', auth, submitCheck);

module.exports = router; 