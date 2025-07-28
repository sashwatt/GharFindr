// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
    loginUser, 
    registerUser, 
    forgotPassword, 
    resetPassword, 
    uploadImage,
    verifyEmail,
    resendVerification,
    sendVerificationEmail
} = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password required')
], loginUser);

router.post('/register', [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  // ...add more as needed
], registerUser);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.post('/upload-image', uploadImage);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// ADD THIS TEMPORARY TEST ROUTE
router.get('/test-email', async (req, res) => {
    try {
        await sendVerificationEmail('your-test-email@gmail.com', '123456');
        res.json({ message: 'Test email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send test email', error: error.message });
    }
});

module.exports = router;