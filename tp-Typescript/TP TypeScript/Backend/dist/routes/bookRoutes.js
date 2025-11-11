"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Backend/routes/bookRoutes.ts
const express_1 = require("express");
const Book_1 = __importDefault(require("../models/Book"));
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const book = new Book_1.default(req.body);
        await book.save();
        res.status(201).json(book);
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: msg });
    }
});
router.get('/', async (_req, res) => {
    const books = await Book_1.default.find().sort({ _id: -1 });
    res.json(books);
});
router.put('/:id', async (req, res) => {
    const { pagesRead } = req.body;
    const book = await Book_1.default.findById(req.params.id);
    if (!book)
        return res.status(404).json({ message: 'Book not found' });
    const value = Math.max(0, Number(pagesRead));
    book.pagesRead = Math.min(value, book.pages);
    book.finished = book.pagesRead >= book.pages;
    await book.save();
    res.json(book);
});
router.delete('/:id', async (req, res) => {
    await Book_1.default.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
});
exports.default = router;
