const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');

dotenv.config();

const app = express();

/* ===== Middleware ===== */
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

/* ===== Sessions ===== */
app.use(session({
  secret: 'notes-app-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false // true только если HTTPS (production)
  }
}));

/* ===== Routes ===== */
const noteRoutes = require('./routes/noteRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/notes', noteRoutes);
app.use('/api/auth', authRoutes);

/* ===== MongoDB ===== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

/* ===== Server ===== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
