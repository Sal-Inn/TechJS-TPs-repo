import Book, { BookFormat, BookStatus } from './book.js';
import { apiList, apiCreate, apiDelete, apiUpdateProgress } from './api.js';
// Sélecteurs DOM typés
const bookListEl = document.getElementById('bookList');
const form = document.getElementById('bookForm');
const statsEl = document.getElementById('globalStats');
if (!bookListEl || !form || !statsEl) {
    throw new Error('Missing required DOM elements (bookList, bookForm, globalStats).');
}
function badge(text) {
    return `<span class="text-xs px-2 py-1 rounded-full bg-slate-100 border">${text}</span>`;
}
function progressBar(percent) {
    return `
    <div class="w-full bg-slate-200 rounded h-2 mt-1">
      <div class="h-2 rounded ${percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}" style="width:${percent}%;"></div>
    </div>
  `;
}
function renderStats(books) {
    const totalPages = books.reduce((a, b) => a + b.pages, 0);
    const totalRead = books.reduce((a, b) => a + b.pagesRead, 0);
    const finished = books.filter(b => b.finished).length;
    const pct = totalPages ? Math.round((totalRead / totalPages) * 100) : 0;
    statsEl.classList.remove('hidden');
    statsEl.innerHTML = `
    <h2 class="text-xl font-semibold mb-2">Global stats</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-slate-50 border rounded p-4">
        <div class="text-3xl font-bold">${books.length}</div>
        <div class="text-slate-500">Books</div>
      </div>
      <div class="bg-slate-50 border rounded p-4">
        <div class="text-3xl font-bold">${finished}</div>
        <div class="text-slate-500">Finished</div>
      </div>
      <div class="bg-slate-50 border rounded p-4">
        <div class="text-3xl font-bold">${totalRead}/${totalPages}</div>
        <div class="text-slate-500">Pages read</div>
      </div>
      <div class="bg-slate-50 border rounded p-4">
        <div class="text-3xl font-bold">${pct}%</div>
        <div class="text-slate-500">Completion</div>
      </div>
    </div>
  `;
}
function renderBookCard(b) {
    const { page, total, percent } = b.currentlyAt();
    return `
    <article class="bg-white rounded-lg shadow p-5" data-id="${b._id ?? ''}">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold">${b.title}</h3>
          <p class="text-slate-600">Author: ${b.author}</p>
          <div class="flex items-center gap-2 mt-1">
            ${badge(b.status)}
            ${badge(b.format)}
            ${b.finished ? '<span class="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Finished</span>' : ''}
          </div>
        </div>
        <button class="btn-delete bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
      </div>

      <div class="mt-3 text-sm">
        <div>Progress: <span class="font-medium">${page}/${total}</span> pages (${percent}%)</div>
        ${progressBar(percent)}
      </div>

      <div class="mt-4 flex items-center gap-2">
        <input type="number" min="0" max="${b.pages}" value="${b.pagesRead}" class="inp-progress border rounded p-2 w-32" />
        <button class="btn-save bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">Save progress</button>
      </div>

      ${b.suggestedBy ? `<div class="mt-3 text-xs text-slate-500">Suggested by: ${b.suggestedBy}</div>` : ''}
    </article>
  `;
}
async function loadAndRender() {
    const data = await apiList();
    const books = data.map(d => new Book(d));
    renderStats(books);
    bookListEl.innerHTML = books.map(renderBookCard).join('');
    // Event delegation par carte
    bookListEl.querySelectorAll('article').forEach(card => {
        const id = card.dataset.id ?? '';
        const btnDelete = card.querySelector('.btn-delete');
        const btnSave = card.querySelector('.btn-save');
        const inp = card.querySelector('.inp-progress');
        if (btnDelete) {
            btnDelete.addEventListener('click', async () => {
                if (!id)
                    return;
                await apiDelete(id);
                await loadAndRender();
            });
        }
        if (btnSave && inp) {
            btnSave.addEventListener('click', async () => {
                if (!id)
                    return;
                const value = Number(inp.value);
                await apiUpdateProgress(id, value);
                await loadAndRender();
            });
        }
    });
}
// helpers de parsing typé pour les champs numériques
const toNum = (v, fallback = 0) => {
    const n = Number(v ?? fallback);
    return Number.isFinite(n) ? n : fallback;
};
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    // Record<string, FormDataEntryValue> → on construit un payload typé
    const payload = {
        title: String(fd.get('title') ?? ''),
        author: String(fd.get('author') ?? ''),
        pages: toNum(fd.get('pages'), 0),
        price: toNum(fd.get('price'), 0),
        pagesRead: toNum(fd.get('pagesRead'), 0),
        status: fd.get('status') ?? BookStatus.WantToRead,
        format: fd.get('format') ?? BookFormat.Print,
        suggestedBy: String(fd.get('suggestedBy') ?? ''),
        finished: false
    };
    if (!payload.title || !payload.author || !payload.pages || payload.pages <= 0) {
        alert('Title, author and pages are required.');
        return;
    }
    if ((payload.pagesRead ?? 0) > (payload.pages ?? 0)) {
        alert('Pages read must be <= total pages');
        return;
    }
    await apiCreate(payload);
    form.reset();
    await loadAndRender();
});
loadAndRender();
