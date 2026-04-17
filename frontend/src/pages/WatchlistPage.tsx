import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../utils/toast';

const EASING = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function WatchlistPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.getWatchlist(),
    enabled: !!user,
  });

  const remove = useMutation({
    mutationFn: (movieId: string) => api.removeFromWatchlist(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast('Removed from watchlist');
    },
  });

  if (!user) {
    return (
      <div className="text-center py-32">
        <div className="text-5xl mb-4">🔒</div>
        <p className="serif text-3xl text-cream mb-2">Your shelf awaits</p>
        <p className="text-warm mb-6">Sign in to build your watchlist.</p>
        <Link to="/login" className="inline-block rounded-lg bg-amber-500 hover:bg-amber-400 px-6 py-3 text-sm font-medium text-[#0a0f1a] transition-all">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-amber mb-3">The Reading List</p>
        <h1 className="serif text-5xl text-cream mb-3">Your Watchlist</h1>
        <p className="text-warm">
          {watchlist?.length
            ? `${watchlist.length} ${watchlist.length === 1 ? 'film' : 'films'} waiting for the right night`
            : 'The shelf is bare'}
        </p>
      </motion.div>

      {!watchlist?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20 rounded-2xl bg-tertiary/30 border border-warm"
        >
          <div className="text-6xl mb-4">📽️</div>
          <p className="serif text-2xl text-cream mb-2">Emptier than a theater on a Tuesday afternoon</p>
          <p className="text-warm mb-6 max-w-md mx-auto">Browse the library and add a few films. Future you will thank present you.</p>
          <Link to="/browse" className="inline-block rounded-lg bg-amber-500 hover:bg-amber-400 px-6 py-3 text-sm font-medium text-[#0a0f1a] transition-all">
            Browse the Archive →
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {watchlist.map((w, i) => (
              <motion.div
                key={w.movieId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: EASING }}
                className="group flex items-center rounded-xl bg-tertiary border border-warm hover:border-amber-500/40 px-5 py-4 transition-all"
              >
                <Link to={`/movie/${w.movieId}`} className="flex-1 min-w-0">
                  <p className="serif text-lg text-cream group-hover:text-amber-400 truncate transition-colors">
                    {w.movieTitle}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Added {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </Link>
                <button
                  onClick={() => remove.mutate(w.movieId)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all ml-4 text-sm cursor-pointer"
                >
                  ✕ Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
