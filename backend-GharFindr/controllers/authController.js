const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const User = require('../models/User'); // Changed to CommonJ
const config = require('../config/config');
const rateLimit = require('express-rate-limit');
const { validationResult } = require('express-validator');


const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 20 * 1000; // 20 seconds

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

const registerUser = async (req, res) => {
    try {
      const { name, email, password, confirm_password, role } = req.body;
      let image = req.file ? req.file.path : null;
  
      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if user already exists
      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
      // Create new user with verification data
      const user = new User({
        name,
        email,
        password,
        confirm_password,
        role,
        image,
        verificationCode,
        verificationCodeExpires,
        isVerified: false,
      });
  
      // Save user first
      await user.save();
  
      // Send verification email
      try {
        await sendVerificationEmail(email, verificationCode);
        console.log("Verification email sent to:", email);
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Still create user but inform about email issue
        return res.status(201).json({
          success: true,
          message: "User registered but verification email failed to send. Please contact support.",
          userData: { email: user.email }
        });
      }
  
      res.status(201).json({
        success: true,
        message: "User registered successfully! Please check your email for verification code.",
        userData: { email: user.email }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error registering user", error });
    }
  };
  

const uploadImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send({ message: "Please upload a file" });
    }
    res.status(200).json({
        success: true,
        data: req.file.filename,
    });
};

// Login a user
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Check email verification
        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: 'Please verify your email before logging in.' 
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({ message: `Account locked. Try again in ${unlockTime} minute(s).` });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Record failed login
            user.recordFailedLogin(req.ip || req.connection.remoteAddress);
            
            if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_TIME);
                user.recordAccountLock();
                await user.save();
                return res.status(423).json({ message: 'Account locked due to too many failed login attempts. Try again in 20 seconds.' });
            }
            await user.save();
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Successful login: reset failed attempts and record success
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.recordSuccessfulLogin(req.ip || req.connection.remoteAddress);
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'SECRETHO',
            { expiresIn: '1h' }
        );

        // Regenerate session to prevent session fixation
        req.session.regenerate((err) => {
          if (err) {
            console.error('Session regeneration error:', err);
            return res.status(500).json({ message: 'Session error' });
          }
          req.session.userId = user._id;
          req.session.save((err) => {
            if (err) {
              console.error('Session save error:', err);
              return res.status(500).json({ message: 'Session error' });
            }
            
            res.status(200).json({ 
                success: true, 
                message: 'Login successful', 
                token, 
                role: user.role, 
                name: user.name,
                _id: user._id 
            });
          });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error logging in', error });
    }
};


const forgotPassword = async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).send({ success: false, msg: "Email is required" });
    }

    try {
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(404).send({ success: false, msg: "This email does not exist." });
        }

        const randomString = randomstring.generate();
        await User.updateOne({ email }, { $set: { token: randomString } });

        // Debugging email value
        console.log("Recipient Email:", userData.email);

        if (userData.email) {
            sendResetPasswordMail(userData.name, userData.email, randomString);
            return res.status(200).send({ success: true, msg: "Please check your inbox to reset your password." });
        } else {
            console.error("User email is missing.");
            return res.status(400).send({ success: false, msg: "Invalid email address." });
        }
    } catch (error) {
        console.error("Error in forgotPassword:", error.message);
        return res.status(500).send({ success: false, msg: error.message });
    }
};


const sendResetPasswordMail = (name, email, token) => {
    console.log("Attempting to send email to:", email); // Debug log

    if (!email) {
        console.error("Recipient email is missing.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: config.emailUser,
            pass: config.emailPassword,
        },
    });

    const mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <p>Hi ${name},</p>
            <p>From GharFindr </p>
            <p> Please click the link below to reset your password:</p>
            <p><a href="https://localhost:5173/reset-password?token=${token}">Reset Password</a></p>
           
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error.message); // Log error
        } else {
            console.log("Email sent successfully:", info.response);
        }
    });
};


const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).send({ success: false, msg: "Token and new password are required." });
    }

    try {
        const userData = await User.findOne({ token });

        if (!userData) {
            return res.status(404).send({ success: false, msg: "Invalid or expired token." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password and clear the token
        await User.updateOne(
            { _id: userData._id },
            { 
                $set: { 
                    password: hashedPassword, 
                    token: null 
                },
                $inc: { 'securityEvents.passwordChanges': 1 },
                $set: { 
                    'securityEvents.lastPasswordChangeAt': new Date(),
                    'activityStats.lastActivityAt': new Date()
                }
            }
        );

        res.status(200).send({ success: true, msg: "Password reset successfully." });
    } catch (error) {
        console.error("Error in resetPassword:", error.message);
        res.status(500).send({ success: false, msg: error.message });
    }
};

// Add logout function with tracking
const logoutUser = async (req, res) => {
  try {
    if (req.user) {
      // Record logout
      const user = await User.findById(req.user.id);
      if (user) {
        user.recordLogout();
        await user.save();
      }
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Error during logout' });
      }
      
      res.status(200).json({ success: true, message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};

// Add function to get user statistics
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        loginStats: user.getLoginStats(),
        securityStats: user.getSecurityStats(),
        activityStats: user.getActivityStats()
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ success: false, message: 'Error getting user statistics' });
  }
};

// controllers/authController.js

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { message: 'Too many login attempts from this ID, please try again after 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const sendVerificationEmail = async (email, code) => {
    console.log("Attempting to send verification email to:", email);
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: config.emailUser,
            pass: config.emailPassword,
        },
    });

    const mailOptions = {
        from: `"GharFindr" <${config.emailUser}>`,
        to: email,
        subject: 'Your Email Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #574FDB;">GharFindr Email Verification</h2>
                <p>Hi there!</p>
                <p>Your verification code is:</p>
                <h1 style="color: #574FDB; font-size: 32px; text-align: center; letter-spacing: 5px; padding: 20px; background: #f0f0f0; border-radius: 10px;">${code}</h1>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <br>
                <p>Best regards,<br>The GharFindr Team</p>
            </div>
        `,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending verification email:", error);
                reject(error);
            } else {
                console.log("Verification email sent successfully:", info.response);
                resolve(info);
            }
        });
    });
};

const verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        
        if (!email || !verificationCode) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }
        
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        
        if (!user.verificationCodeExpires || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error in verifyEmail:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
};

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send new verification email
        await sendVerificationEmail(email, verificationCode);

        res.status(200).json({ message: 'Verification code resent successfully' });
    } catch (error) {
        console.error('Error in resendVerification:', error);
        res.status(500).json({ message: 'Error resending verification code' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    sendResetPasswordMail,
    resetPassword,
    uploadImage,
    loginLimiter,
    verifyEmail,
    resendVerification,
    sendVerificationEmail,
    logoutUser,
    getUserStats
};