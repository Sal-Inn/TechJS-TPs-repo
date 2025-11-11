// Enums pour bien typer status/format
export var BookStatus;
(function (BookStatus) {
    BookStatus["Read"] = "Read";
    BookStatus["Reread"] = "Re-read";
    BookStatus["DNF"] = "DNF";
    BookStatus["CurrentlyReading"] = "Currently reading";
    BookStatus["ReturnedUnread"] = "Returned Unread";
    BookStatus["WantToRead"] = "Want to read";
})(BookStatus || (BookStatus = {}));
export var BookFormat;
(function (BookFormat) {
    BookFormat["Print"] = "Print";
    BookFormat["PDF"] = "PDF";
    BookFormat["Ebook"] = "Ebook";
    BookFormat["AudioBook"] = "AudioBook";
})(BookFormat || (BookFormat = {}));
// Classe métier côté front
export default class Book {
    constructor(data) {
        this._id = data._id;
        this.title = data.title;
        this.author = data.author;
        this.pages = Number(data.pages);
        this.status = (data.status ?? BookStatus.WantToRead);
        this.price = Number(data.price ?? 0);
        this.pagesRead = Math.min(Number(data.pagesRead ?? 0), this.pages);
        this.format = (data.format ?? BookFormat.Print);
        this.suggestedBy = data.suggestedBy ?? '';
        this.finished = Boolean(data.finished ?? this.pagesRead >= this.pages);
    }
    currentlyAt() {
        const percent = this.pages ? Math.round((this.pagesRead / this.pages) * 100) : 0;
        return { page: this.pagesRead, total: this.pages, percent };
    }
    async deleteBook(apiDelete) {
        if (!this._id)
            throw new Error('No _id on book');
        await apiDelete(this._id);
    }
}
