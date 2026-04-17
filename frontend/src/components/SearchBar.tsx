import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

const TMDB_IMG = 'https://image.tmdb.org/t/p';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { data: results } = useQuery({
    queryKey: ['search', debouncedQuery, aiMode],
    queryFn: () => aiMode ? api.semanticSearch(debouncedQuery) : api.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <button
        onClick={() => setAiMode(!aiMode)}
        className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
          aiMode
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            : 'bg-tertiary text-muted border-warm hover:text-warm'
        }`}
        title={aiMode ? 'AI semantic search' : 'Title search'}
      >
        {aiMode ? '✨ AI' : 'Title'}
      </button>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="w-44 sm:w-64 rounded-full bg-tertiary border border-warm px-4 py-1.5 pr-8 text-sm text-cream placeholder-muted outline-none focus:border-amber-500/40 focus:bg-elevated transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-mono">/</span>
      </div>

      <AnimatePresence>
        {open && results && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-96 rounded-xl bg-secondary border border-warm shadow-2xl z-50 max-h-96 overflow-y-auto backdrop-blur-xl"
          >
            {results.map(movie => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                onClick={() => { setOpen(false); setQuery(''); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors border-b border-warm last:border-0"
              >
                {movie.posterUrl ? (
                  <img src={`${TMDB_IMG}/w92${movie.posterUrl}`} alt="" className="w-9 h-13 rounded object-cover" />
                ) : (
                  <div className="w-9 h-13 rounded bg-tertiary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="serif text-sm text-cream truncate">{movie.title}</p>
                  <p className="text-xs text-muted mt-0.5">{movie.releaseYear} · ⭐ {movie.voteAvg}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
