const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    token: {
        type: String,
        default: ''
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }], // Added
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    
    // Add these fields for brute force prevention
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    
    // Login Tracking Fields
    loginStats: {
        totalLogins: { type: Number, default: 0 },
        totalFailedLogins: { type: Number, default: 0 },
        totalSuccessfulLogins: { type: Number, default: 0 },
        lastLoginAt: { type: Date, default: null },
        lastFailedLoginAt: { type: Date, default: null },
        lastLoginIP: { type: String, default: null },
        lastFailedLoginIP: { type: String, default: null },
        consecutiveFailedLogins: { type: Number, default: 0 },
        accountLockedCount: { type: Number, default: 0 },
        lastLockedAt: { type: Date, default: null },
        totalLockTime: { type: Number, default: 0 }, // in milliseconds
    },
    
    // Security Events Tracking
    securityEvents: {
        passwordChanges: { type: Number, default: 0 },
        lastPasswordChangeAt: { type: Date, default: null },
        PasswordExpiresAt: { type: Date, default: '2025-9-1' },
        passwordResetRequests: { type: Number, default: 0 },
        lastPasswordResetRequestAt: { type: Date, default: null },
        suspiciousActivities: { type: Number, default: 0 },
        lastSuspiciousActivityAt: { type: Date, default: null },
    },
    
    // Session Tracking
    sessionStats: {
        totalSessions: { type: Number, default: 0 },
        activeSessions: { type: Number, default: 0 },
        lastSessionAt: { type: Date, default: null },
        averageSessionDuration: { type: Number, default: 0 }, // in milliseconds
    },
    
    // Activity Tracking
    activityStats: {
        profileUpdates: { type: Number, default: 0 },
        lastProfileUpdateAt: { type: Date, default: null },
        roomsCreated: { type: Number, default: 0 },
        roommatesCreated: { type: Number, default: 0 },
        paymentsMade: { type: Number, default: 0 },
        totalAmountSpent: { type: Number, default: 0 },
        lastActivityAt: { type: Date, default: null },
    }
    
}, { timestamps: true });

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Login tracking methods
userSchema.methods.recordSuccessfulLogin = function(ipAddress) {
  this.loginStats.totalLogins += 1;
  this.loginStats.totalSuccessfulLogins += 1;
  this.loginStats.lastLoginAt = new Date();
  this.loginStats.lastLoginIP = ipAddress;
  this.loginStats.consecutiveFailedLogins = 0; // Reset consecutive failures
  this.activityStats.lastActivityAt = new Date();
  this.sessionStats.lastSessionAt = new Date();
  this.sessionStats.totalSessions += 1;
  this.sessionStats.activeSessions += 1;
};

userSchema.methods.recordFailedLogin = function(ipAddress) {
  this.loginStats.totalFailedLogins += 1;
  this.loginStats.lastFailedLoginAt = new Date();
  this.loginStats.lastFailedLoginIP = ipAddress;
  this.loginStats.consecutiveFailedLogins += 1;
  this.failedLoginAttempts += 1;
};

userSchema.methods.recordAccountLock = function() {
  this.loginStats.accountLockedCount += 1;
  this.loginStats.lastLockedAt = new Date();
};

userSchema.methods.recordAccountUnlock = function() {
  const lockDuration = Date.now() - this.loginStats.lastLockedAt.getTime();
  this.loginStats.totalLockTime += lockDuration;
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
};

userSchema.methods.recordPasswordChange = function() {
  this.securityEvents.passwordChanges += 1;
  this.securityEvents.lastPasswordChangeAt = new Date();
  this.activityStats.lastActivityAt = new Date();
};

userSchema.methods.recordEmailVerification = function() {
  this.securityEvents.emailVerifications += 1;
  this.securityEvents.lastEmailVerificationAt = new Date();
  this.activityStats.lastActivityAt = new Date();
};

userSchema.methods.recordPasswordResetRequest = function() {
  this.securityEvents.passwordResetRequests += 1;
  this.securityEvents.lastPasswordResetRequestAt = new Date();
  this.activityStats.lastActivityAt = new Date();
};

userSchema.methods.recordSuspiciousActivity = function() {
  this.securityEvents.suspiciousActivities += 1;
  this.securityEvents.lastSuspiciousActivityAt = new Date();
};

userSchema.methods.recordProfileUpdate = function() {
  this.activityStats.profileUpdates += 1;
  this.activityStats.lastProfileUpdateAt = new Date();
  this.activityStats.lastActivityAt = new Date();
};

userSchema.methods.recordRoomCreation = function() {
  this.activityStats.roomsCreated += 1;
  this.activityStats.lastActivityAt = new Date();
};

userSchema.methods.recordRoommateCreation = function() {
  this.activityStats.roommatesCreated += 1;
  this.activityStats.lastActivityAt = new Date();
};

userSchema.methods.recordPayment = function(amount) {
  this.activityStats.paymentsMade += 1;
  this.activityStats.totalAmountSpent += amount;
  this.activityStats.lastActivityAt = new Date();
};

userSchema.methods.recordLogout = function() {
  this.sessionStats.activeSessions = Math.max(0, this.sessionStats.activeSessions - 1);
};

// Get login statistics
userSchema.methods.getLoginStats = function() {
  return {
    totalLogins: this.loginStats.totalLogins,
    totalFailedLogins: this.loginStats.totalFailedLogins,
    totalSuccessfulLogins: this.loginStats.totalSuccessfulLogins,
    successRate: this.loginStats.totalLogins > 0 
      ? ((this.loginStats.totalSuccessfulLogins / this.loginStats.totalLogins) * 100).toFixed(2) + '%'
      : '0%',
    lastLoginAt: this.loginStats.lastLoginAt,
    lastLoginIP: this.loginStats.lastLoginIP,
    consecutiveFailedLogins: this.loginStats.consecutiveFailedLogins,
    accountLockedCount: this.loginStats.accountLockedCount,
    totalLockTime: this.loginStats.totalLockTime
  };
};

// Get security statistics
userSchema.methods.getSecurityStats = function() {
  return {
    passwordChanges: this.securityEvents.passwordChanges,
    lastPasswordChangeAt: this.securityEvents.lastPasswordChangeAt,
    emailVerifications: this.securityEvents.emailVerifications,
    lastEmailVerificationAt: this.securityEvents.lastEmailVerificationAt,
    passwordResetRequests: this.securityEvents.passwordResetRequests,
    lastPasswordResetRequestAt: this.securityEvents.lastPasswordResetRequestAt,
    suspiciousActivities: this.securityEvents.suspiciousActivities,
    lastSuspiciousActivityAt: this.securityEvents.lastSuspiciousActivityAt
  };
};

// Get activity statistics
userSchema.methods.getActivityStats = function() {
  return {
    profileUpdates: this.activityStats.profileUpdates,
    lastProfileUpdateAt: this.activityStats.lastProfileUpdateAt,
    roomsCreated: this.activityStats.roomsCreated,
    roommatesCreated: this.activityStats.roommatesCreated,
    paymentsMade: this.activityStats.paymentsMade,
    totalAmountSpent: this.activityStats.totalAmountSpent,
    lastActivityAt: this.activityStats.lastActivityAt
  };
};

const User = mongoose.model('User', userSchema);
module.exports = User;