const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createWebsite } = require('../controllers/websiteController');

router.post('/', auth, createWebsite);

module.exports = router; 