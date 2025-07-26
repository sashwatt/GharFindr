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

router.post('/login', loginUser);
router.post('/register', registerUser);
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