const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const User = require('../models/User'); // Changed to CommonJ
const config = require('../config/config');
const rateLimit = require('express-rate-limit');


const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 20 * 1000; // 20 seconds

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
  
      // Create new user (NO manual hashing here)
      const user = new User({
        name,
        email,
        password,  // <-- Let Mongoose handle hashing in the model
        confirm_password,
        role,
        image,
      });
  
      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "SECRETHO",
        { expiresIn: "1h" }
      );
  
      // Save token to user document
      user.token = token;
      await user.save();
  
      res.status(201).json({
        success: true,
        message: "User registered successfully!",
        token,
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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Check if account is locked
        if (user.isLocked()) {
            const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({ message: `Account locked. Try again in ${unlockTime} minute(s).` });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_TIME);
                await user.save();
                return res.status(423).json({ message: 'Account locked due to too many failed login attempts. Try again in 20 seconds.' });
            }
            await user.save();
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Successful login: reset failed attempts and lock
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'SECRETHO',
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            token, 
            role: user.role, 
            name: user.name,
            _id: user._id 
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
        // Find user by token
        const userData = await User.findOne({ token });

        if (!userData) {
            return res.status(404).send({ success: false, msg: "Invalid or expired token." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password and clear the token
        await User.updateOne(
            { _id: userData._id },
            { $set: { password: hashedPassword, token: null } }
        );

        res.status(200).send({ success: true, msg: "Password reset successfully." });
    } catch (error) {
        console.error("Error in resetPassword:", error.message);
        res.status(500).send({ success: false, msg: error.message });
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

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    sendResetPasswordMail,
    resetPassword,
    uploadImage,
    loginLimiter,
};