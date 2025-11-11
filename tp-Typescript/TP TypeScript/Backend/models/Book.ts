import { Schema, model, Document } from 'mongoose';

export type BookStatus =
  | 'Read' | 'Re-read' | 'DNF' | 'Currently reading' | 'Returned Unread' | 'Want to read';
export type BookFormat = 'Print' | 'PDF' | 'Ebook' | 'AudioBook';

export interface IBook extends Document {
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
  price: number;
  pagesRead: number;
  format: BookFormat;
  suggestedBy?: string;
  finished: boolean;
}

const bookSchema = new Schema<IBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  pages: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['Read','Re-read','DNF','Currently reading','Returned Unread','Want to read'],
    default: 'Want to read'
  },
  price: { type: Number, default: 0 },
  pagesRead: { type: Number, default: 0, min: 0 },
  format: { type: String, enum: ['Print','PDF','Ebook','AudioBook'], default: 'Print' },
  suggestedBy: { type: String, default: '' },
  finished: { type: Boolean, default: false }
});

bookSchema.pre('save', function (next) {
  this.finished = this.pagesRead >= this.pages;
  if (this.pagesRead > this.pages) this.pagesRead = this.pages;
  next();
});

export default model<IBook>('Book', bookSchema);
