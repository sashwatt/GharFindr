const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const sessionMiddleware = session({
  name: 'gharfindr.sid',
  secret: process.env.SESSION_SECRET || 'supersecretkey', // Use a strong secret in production!
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/db_gharfindr',
    collectionName: 'sessions',
    ttl: 60 * 30, 
    autoRemove: 'native'
  }),
  cookie: {
    maxAge: 1000 * 10, // 30 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    sameSite: 'strict'
  },
  rolling: true // Reset maxAge on every response
});

module.exports = sessionMiddleware;
