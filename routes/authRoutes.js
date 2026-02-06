const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { username, password }
 * - Creates user with bcrypt-hashed password
 * - Returns 201 on success
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // validation
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).send('Bad request');
    }

    const u = username.trim();
    if (!u || password.length < 4) {
      return res.status(400).send('Bad request');
    }

    // check existing user
    const exists = await User.findOne({ username: u });
    if (exists) {
      return res.status(409).send('User already exists');
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    await User.create({ username: u, password: hash });
    return res.sendStatus(201);
  } catch (e) {
    // helpful log for debugging (можно оставить)
    console.error('REGISTER ERROR:', e);
    return res.sendStatus(500);
  }
});

/**
 * POST /api/auth/login
 * Body: { username, password }
 * - Creates session on success
 * - Returns 200 on success
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // keep same message for security
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).send('Invalid credentials');
    }

    const u = username.trim();
    if (!u || !password) {
      return res.status(400).send('Invalid credentials');
    }

    const user = await User.findOne({ username: u });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).send('Invalid credentials');
    }

    // create session
    req.session.userId = user._id;

    return res.sendStatus(200);
  } catch (e) {
    console.error('LOGIN ERROR:', e);
    return res.sendStatus(500);
  }
});

/**
 * POST /api/auth/logout
 * - Destroys session
 * - Returns 200 always
 */
router.post('/logout', (req, res) => {
  if (!req.session) return res.sendStatus(200);

  req.session.destroy(() => {
    // default cookie name from express-session is "connect.sid"
    res.clearCookie('connect.sid', {
      httpOnly: true,
      sameSite: 'lax'
      // secure: true, // включи на https в проде
    });

    return res.sendStatus(200);
  });
});

/**
 * GET /api/auth/me
 * - Returns login state
 */
router.get('/me', (req, res) => {
  return res.status(200).json({ loggedIn: !!req.session?.userId });
});

module.exports = router;
