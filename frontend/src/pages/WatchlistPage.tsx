import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  if (!user) return <p className="text-zinc-400">Sign in to see your watchlist.</p>;
  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>
      {!watchlist?.length ? (
        <p className="text-zinc-500">No movies yet. Browse and add some!</p>
      ) : (
        <div className="space-y-2">
          {watchlist.map(w => (
            <div key={w.movieId} className="flex items-center rounded-lg bg-zinc-900 px-4 py-3 hover:bg-zinc-800 transition">
              <Link to={`/movie/${w.movieId}`} className="flex-1">
                <span className="font-medium">{w.movieTitle}</span>
                <span className="text-zinc-500 text-sm ml-2">added {new Date(w.createdAt).toLocaleDateString()}</span>
              </Link>
              <button onClick={() => remove.mutate(w.movieId)}
                className="text-zinc-500 hover:text-red-400 transition ml-4 text-sm">✕ Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
