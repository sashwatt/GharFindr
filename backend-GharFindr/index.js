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
require("dotenv").config();

const app = express();

// Connect to DB
connectDb();

// Enable CORS
app.use(cors({
  origin: 'https://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Apply session middleware BEFORE your protected/login routes
app.use(sessionMiddleware);

// Add XSS protection
app.use(xss());

// Add mongo-sanitize middleware
app.use(mongoSanitize());

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
