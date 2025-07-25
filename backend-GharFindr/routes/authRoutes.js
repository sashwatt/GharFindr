// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, registerUser, forgotPassword, resetPassword, uploadImage } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.post('/upload-image', uploadImage);

module.exports = router;