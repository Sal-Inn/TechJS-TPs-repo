"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    pages: { type: Number, required: true, min: 1 },
    status: {
        type: String,
        enum: ['Read', 'Re-read', 'DNF', 'Currently reading', 'Returned Unread', 'Want to read'],
        default: 'Want to read'
    },
    price: { type: Number, default: 0 },
    pagesRead: { type: Number, default: 0, min: 0 },
    format: { type: String, enum: ['Print', 'PDF', 'Ebook', 'AudioBook'], default: 'Print' },
    suggestedBy: { type: String, default: '' },
    finished: { type: Boolean, default: false }
});
bookSchema.pre('save', function (next) {
    this.finished = this.pagesRead >= this.pages;
    if (this.pagesRead > this.pages)
        this.pagesRead = this.pages;
    next();
});
exports.default = (0, mongoose_1.model)('Book', bookSchema);
