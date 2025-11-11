// src/app.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const passport = require('passport');

// Charge la stratégie Local (doit être AVANT passport.initialize())
require('./passport');

const app = express();

/* ---------- MongoDB ---------- */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth_books';

mongoose.set('strictQuery', true);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ---------- Moteur de vues / Middleware ---------- */
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // pour <form>
app.use(express.json()); // si tu envoies du JSON un jour

// (Optionnel) petit logger pour diagnostiquer les 404
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ---------- Session + Passport ---------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 jour
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ---------- Données en mémoire (books) ---------- */
// Réinitialisées à chaque redémarrage (volatiles)
app.locals.books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin' },
];
app.locals.nextBookId = app.locals.books.length + 1;

/* ---------- Routes ---------- */
// Page d’accueil -> redirige selon l’état d’authentification
app.get('/', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) return res.redirect('/books');
  return res.redirect('/login');
});

// Monte les routes d’authentification à la racine -> /login, /register, /logout
app.use('/', require('./routes/auth'));

// Monte les routes livres (elles définissent /books)
app.use('/', require('./routes/books'));

/* ---------- 404 & gestion d’erreurs ---------- */
// 404 tout à la fin
app.use((req, res) => res.status(404).send('Not Found'));

// (optionnel) gestion d’erreurs
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

/* ---------- Démarrage ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
