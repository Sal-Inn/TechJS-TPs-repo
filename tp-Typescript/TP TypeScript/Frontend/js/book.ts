export enum BookStatus {
  Read = 'Read',
  Reread = 'Re-read',
  DNF = 'DNF',
  CurrentlyReading = 'Currently reading',
  ReturnedUnread = 'Returned Unread',
  WantToRead = 'Want to read'
}
export enum BookFormat {
  Print = 'Print',
  PDF = 'PDF',
  Ebook = 'Ebook',
  AudioBook = 'AudioBook'
}
export interface BookDTO {
  _id?: string;
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
export default class Book implements BookDTO {
  _id?: string;
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
  price: number;
  pagesRead: number;
  format: BookFormat;
  suggestedBy?: string;
  finished: boolean;

  constructor(data: Partial<BookDTO> & Pick<BookDTO, 'title' | 'author' | 'pages'>) {
    this._id = data._id;
    this.title = data.title;
    this.author = data.author;
    this.pages = Number(data.pages);

    this.status = (data.status ?? BookStatus.WantToRead) as BookStatus;
    this.price = Number(data.price ?? 0);
    this.pagesRead = Math.min(Number(data.pagesRead ?? 0), this.pages);
    this.format = (data.format ?? BookFormat.Print) as BookFormat;
    this.suggestedBy = data.suggestedBy ?? '';
    this.finished = Boolean(data.finished ?? this.pagesRead >= this.pages);
  }

  currentlyAt(): { page: number; total: number; percent: number } {
    const percent = this.pages ? Math.round((this.pagesRead / this.pages) * 100) : 0;
    return { page: this.pagesRead, total: this.pages, percent };
  }

  async deleteBook(apiDelete: (id: string) => Promise<unknown>): Promise<void> {
    if (!this._id) throw new Error('No _id on book');
    await apiDelete(this._id);
  }
}
