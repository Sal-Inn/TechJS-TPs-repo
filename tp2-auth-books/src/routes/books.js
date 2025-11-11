// routes/books.js
const express = require('express');
const router = express.Router();

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect('/login');
}

// Liste des livres (protégée)
router.get('/books', ensureAuth, (req, res) => {
  res.render('books', {
    user: req.user,
    books: req.app.locals.books,
  });
});

// Ajout d’un livre (protégée)
router.post('/books', ensureAuth, (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) return res.redirect('/books');
  const id = req.app.locals.nextBookId++;
  req.app.locals.books.push({ id, title, author });
  res.redirect('/books');
});

// Suppression d’un livre (protégée)
router.post('/books/:id/delete', ensureAuth, (req, res) => {
  const id = Number(req.params.id);
  req.app.locals.books = req.app.locals.books.filter((b) => b.id !== id);
  res.redirect('/books');
});

module.exports = router;
