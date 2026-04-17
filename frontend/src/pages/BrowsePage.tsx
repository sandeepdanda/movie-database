import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { MovieCard } from '../components/MovieCard';

const DECADES = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s'];

const GENRE_ICONS: Record<string, string> = {
  Action: '💥', Adventure: '🗺️', Animation: '🎨', Comedy: '😂',
  Crime: '🔫', Documentary: '📽️', Drama: '🎭', Family: '👨‍👩‍👧',
  Fantasy: '🧙', History: '📜', Horror: '👻', Music: '🎵',
  Mystery: '🔎', Romance: '💕', 'Science Fiction': '🚀', 'TV Movie': '📺',
  Thriller: '😱', War: '⚔️', Western: '🤠', Foreign: '🌍',
};

const EASING = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const genre = params.get('genre') || undefined;
  const decade = params.get('decade') || undefined;
  const sort = params.get('sort') || 'rating';

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: api.getGenres,
  });

  const { data: movies, isLoading } = useQuery({
    queryKey: ['movies', 'browse', genre, decade, sort],
    queryFn: () => api.browseMovies({ genre, decade, sort, limit: 30 }),
  });

  function setFilter(key: string, value: string | undefined) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key === 'genre') next.delete('decade');
    if (key === 'decade') next.delete('genre');
    setParams(next);
  }

  function clearAll() {
    setParams(new URLSearchParams());
  }

  function surpriseMe() {
    if (!movies || movies.length === 0) return;
    const pick = movies[Math.floor(Math.random() * movies.length)];
    navigate(`/movie/${pick.id}`);
  }

  const activeFilters = [genre, decade].filter(Boolean);

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-amber mb-3">The Library</p>
        <h1 className="serif text-5xl text-cream mb-3">Browse the Archive</h1>
        <p className="text-warm">Flip through the shelves. Filter by mood. Or let fate decide.</p>
      </div>

      {/* Surprise Me */}
      <motion.button
        onClick={surpriseMe}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!movies?.length}
        className="mb-8 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-5 py-2.5 text-sm font-medium text-[#0a0f1a] cursor-pointer disabled:opacity-50 shadow-lg shadow-amber-500/20 transition-all"
      >
        🎲 Surprise Me
      </motion.button>

      {/* Genre chips */}
      <div className="mb-6">
        <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Genre</p>
        <div className="flex flex-wrap gap-2">
          {genres?.map(g => {
            const isActive = genre === g;
            return (
              <button
                key={g}
                onClick={() => setFilter('genre', isActive ? undefined : g)}
                className={`rounded-full px-4 py-2 text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-[#0a0f1a] border border-amber-400'
                    : 'bg-tertiary text-warm border border-warm hover:border-amber-500/40 hover:text-cream'
                }`}
              >
                <span className="mr-1.5">{GENRE_ICONS[g] || '🎬'}</span>
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Decade chips */}
      <div className="mb-6">
        <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Era</p>
        <div className="flex flex-wrap gap-2">
          {DECADES.map(d => {
            const isActive = decade === d;
            return (
              <button
                key={d}
                onClick={() => setFilter('decade', isActive ? undefined : d)}
                className={`rounded-full px-4 py-2 text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-[#0a0f1a] border border-amber-400'
                    : 'bg-tertiary text-warm border border-warm hover:border-amber-500/40 hover:text-cream'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort toggle + active filters */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-full bg-tertiary border border-warm p-1">
          <button
            onClick={() => setFilter('sort', 'rating')}
            className={`text-xs px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              sort === 'rating' ? 'bg-elevated text-cream' : 'text-muted hover:text-warm'
            }`}
          >
            Top Rated
          </button>
          <button
            onClick={() => setFilter('sort', 'popularity')}
            className={`text-xs px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              sort === 'popularity' ? 'bg-elevated text-cream' : 'text-muted hover:text-warm'
            }`}
          >
            Most Popular
          </button>
        </div>

        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-muted hover:text-amber transition-colors cursor-pointer"
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading && <div className="flex justify-center py-20"><div className="spinner" /></div>}

      <motion.div
        key={`${genre}-${decade}-${sort}`}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {movies?.map(movie => (
          <motion.div
            key={movie.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASING } }
            }}
          >
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </motion.div>

      {movies?.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <p className="serif text-2xl text-cream mb-2">No matches found</p>
          <p className="text-warm">The shelves are bare for this combo. Try different filters.</p>
        </div>
      )}
    </div>
  );
}
