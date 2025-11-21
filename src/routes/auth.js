// routes/auth.js
const express = require('express');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

function ensureGuest(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return res.redirect('/books');
  return next();
}

// --- Affichage des formulaires ---
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', {
    error: req.query.error,
    registered: req.query.registered,
    logout: req.query.logout,
  });
});

router.get('/register', ensureGuest, (req, res) => {
  res.render('register', { error: req.query.error });
});

// --- Inscription ---
router.post('/register', ensureGuest, async (req, res) => {
  try {
    const { username, email, password, confirm } = req.body;
    if (!username || !email || !password || !confirm) {
      return res.redirect('/register?error=missing');
    }
    if (password !== confirm) {
      return res.redirect('/register?error=nomatch');
    }
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.redirect('/register?error=exists');

    const user = new User({ username, email, password });
    await user.save();

    // Redirige vers login après inscription
    return res.redirect('/login?registered=1');
  } catch (e) {
    return res.redirect('/register?error=server');
  }
});

// --- Connexion ---
router.post(
  '/login',
  ensureGuest,
  passport.authenticate('local', {
    successRedirect: '/books',
    failureRedirect: '/login?error=1',
  })
);

// --- Déconnexion ---
router.get('/logout', (req, res, next) => {
  // Passport 0.6+ : callback
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login?logout=1');
  });
});

module.exports = router;
