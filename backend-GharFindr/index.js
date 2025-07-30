const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const connectDb = require("./config/db");
const AuthRouter = require("./routes/authRoutes");
const MobileRouter = require("./routes/mobileRoutes");
const protectedRouter = require("./routes/protectedRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const roommateRoutes = require("./routes/roommatesRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const emailRoutes = require("./routes/emailRoutes");
const contactRoutes = require("./routes/contactRoutes");
const esewaRoutes = require("./routes/esewaRoutes");
const sessionMiddleware = require("./middleware/session");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Connect to DB
connectDb();

// Cleaned up CORS configuration to avoid conflicts
app.use(cors({
  origin: 'https://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token', 'x-csrf-token'], // Explicitly added 'x-csrf-token'
  credentials: true
}));

app.use(express.json());

// Use cookie-parser before csurf
app.use(cookieParser());

// Apply session middleware BEFORE your protected/login routes
app.use(sessionMiddleware);

// Add XSS protection
app.use(xss());

// Add mongo-sanitize middleware
app.use(mongoSanitize());

// CSRF protection middleware
const csrfProtection = csurf({ cookie: true });

// Apply CSRF protection globally
app.use(csrfProtection);

// Route to send CSRF token to the frontend
app.get('/api/csrf-token', (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

// Debugging CSRF token
app.use((req, res, next) => {
  console.log('CSRF Token:', req.csrfToken ? req.csrfToken() : 'Not available');
  console.log('Session:', req.session);
  next();
});

// Route handling
app.use("/api/auth", AuthRouter);
app.use("/api/v1/", MobileRouter);
app.use("/api/protected", protectedRouter);
app.use("/api/rooms", roomRoutes);
app.use("/api/user", userRoutes);
app.use("/api", wishlistRoutes);
app.use("/api/email", emailRoutes);
app.use("/api", contactRoutes);
app.use("/api/esewa", esewaRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/roommates", roommateRoutes);

// Add helmet for extra security headers
app.use(helmet());

// CORS headers middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://localhost:5173"); // Frontend origin
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, CSRF-Token, x-csrf-token"); // Added 'x-csrf-token'
  res.header("Access-Control-Allow-Credentials", "true"); // Allow cookies
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Logout route to clear CSRF token and destroy session
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out' });
    }
    res.clearCookie('_csrf'); // Clear CSRF cookie
    res.clearCookie('gharfindr.sid'); // Clear session cookie
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Load HTTPS credentials
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "ssl", "localhost-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "ssl", "localhost.pem")),
};

// Start HTTPS server
const port = 3000;
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`HTTPS server running at https://localhost:${port}`);
});
