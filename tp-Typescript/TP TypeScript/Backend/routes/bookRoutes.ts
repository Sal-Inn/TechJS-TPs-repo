// Backend/routes/bookRoutes.ts
import { Router, Request, Response } from 'express';
import Book, { IBook } from '../models/Book';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const book = new Book(req.body as Partial<IBook>);
    await book.save();
    res.status(201).json(book);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: msg });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  const books = await Book.find().sort({ _id: -1 });
  res.json(books);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { pagesRead } = req.body as { pagesRead: number };
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const value = Math.max(0, Number(pagesRead));
  book.pagesRead = Math.min(value, book.pages);
  book.finished = book.pagesRead >= book.pages;
  await book.save();

  res.json(book);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Book deleted' });
});

export default router; 