import type { MovieResponse, MovieSummary, PersonResponse } from './types';

const BASE = '/api/v1';

function getToken() {
  const stored = localStorage.getItem('user');
  if (stored) return JSON.parse(stored).token;
  return null;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function authGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function authPost(path: string, body: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function authDelete(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getMovie: (id: string) => get<MovieResponse>(`/movies/${id}`),

  getSimilarMovies: (id: string, limit = 6) => get<MovieSummary[]>(`/movies/${id}/similar?limit=${limit}`),

  browseMovies: (params: { genre?: string; decade?: string; sort?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.genre) query.set('genre', params.genre);
    if (params.decade) query.set('decade', params.decade);
    if (params.sort) query.set('sort', params.sort);
    if (params.limit) query.set('limit', String(params.limit));
    return get<MovieSummary[]>(`/movies?${query}`);
  },

  getPerson: (id: string) => get<PersonResponse>(`/persons/${id}`),

  getGenres: () => get<string[]>(`/genres`),

  search: (q: string, limit = 10) => get<MovieSummary[]>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  semanticSearch: (q: string, limit = 10) => get<MovieSummary[]>(`/search/semantic?q=${encodeURIComponent(q)}&limit=${limit}`),

  chat: (message: string) => fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  }),

  // Watchlist (auth required)
  getWatchlist: () => authGet<{ movieId: string; movieTitle: string; createdAt: string }[]>('/watchlist'),
  addToWatchlist: (movieId: string, movieTitle: string) => authPost(`/watchlist/${movieId}`, { movieTitle }),
  removeFromWatchlist: (movieId: string) => authDelete(`/watchlist/${movieId}`),

  // Ratings (auth required)
  getRatings: () => authGet<{ movieId: string; movieTitle: string; rating: number; createdAt: string }[]>('/ratings'),
  rateMovie: (movieId: string, movieTitle: string, rating: number) => authPost(`/ratings/${movieId}`, { movieTitle, rating }),
};
