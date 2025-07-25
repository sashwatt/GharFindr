// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');



router.post('/login', loginUser);

module.exports = router;