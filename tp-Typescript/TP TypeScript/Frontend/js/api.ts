import type { BookDTO } from './book';

const API_URL = 'http://localhost:5000/api/books';

async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} ${body}`);
  }
  return res.json() as Promise<T>;
}

export function apiList(): Promise<BookDTO[]> {
  return jsonFetch<BookDTO[]>(API_URL);
}

export function apiCreate(payload: Partial<BookDTO>): Promise<BookDTO> {
  return jsonFetch<BookDTO>(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function apiDelete(id: string): Promise<{ message: string }> {
  return jsonFetch<{ message: string }>(`${API_URL}/${id}`, { method: 'DELETE' });
}

export function apiUpdateProgress(id: string, pagesRead: number): Promise<BookDTO> {
  return jsonFetch<BookDTO>(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pagesRead })
  });
}
