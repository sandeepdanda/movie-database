import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function WatchlistPage() {
  const { user } = useAuth();
  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.getWatchlist(),
    enabled: !!user,
  });

  if (!user) return <p className="text-zinc-400">Sign in to see your watchlist.</p>;
  if (isLoading) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>
      {!watchlist?.length ? (
        <p className="text-zinc-500">No movies yet. Browse and add some!</p>
      ) : (
        <div className="space-y-2">
          {watchlist.map(w => (
            <Link key={w.movieId} to={`/movie/${w.movieId}`}
              className="block rounded-lg bg-zinc-900 px-4 py-3 hover:bg-zinc-800 transition">
              <span className="font-medium">{w.movieTitle}</span>
              <span className="text-zinc-500 text-sm ml-2">added {new Date(w.createdAt).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
