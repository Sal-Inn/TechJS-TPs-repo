const API_URL = 'http://localhost:5000/api/books';
// petit helper fetch typé
async function jsonFetch(input, init) {
    const res = await fetch(input, init);
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText} ${body}`);
    }
    return res.json();
}
export function apiList() {
    return jsonFetch(API_URL);
}
export function apiCreate(payload) {
    return jsonFetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}
export function apiDelete(id) {
    return jsonFetch(`${API_URL}/${id}`, { method: 'DELETE' });
}
export function apiUpdateProgress(id, pagesRead) {
    return jsonFetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagesRead })
    });
}
