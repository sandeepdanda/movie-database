import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function StatsPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
    enabled: !!user,
  });

  if (!user) return <p className="text-zinc-400">Sign in to see your stats.</p>;
  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;
  if (!stats) return null;

  const maxRatingCount = Math.max(...Object.values(stats.ratingDistribution), 1);
  const maxGenreCount = Math.max(...stats.topGenres.map(g => g.count), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Your Movie Stats</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl bg-zinc-900 p-6 text-center">
          <p className="text-3xl font-bold text-blue-400">{stats.totalRated}</p>
          <p className="text-sm text-zinc-500 mt-1">Movies Rated</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-6 text-center">
          <p className="text-3xl font-bold text-green-400">{stats.totalWatchlist}</p>
          <p className="text-sm text-zinc-500 mt-1">In Watchlist</p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-6 text-center">
          <p className="text-3xl font-bold text-yellow-400">⭐ {stats.averageRating}</p>
          <p className="text-sm text-zinc-500 mt-1">Avg Rating</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Rating distribution */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Rating Distribution</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.ratingDistribution[star] || 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400 w-8">{star} ★</span>
                  <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded transition-all"
                      style={{ width: `${(count / maxRatingCount) * 100}%` }} />
                  </div>
                  <span className="text-sm text-zinc-500 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top genres */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Top Genres</h2>
          {stats.topGenres.length === 0 ? (
            <p className="text-zinc-500 text-sm">Rate some movies to see your genre breakdown!</p>
          ) : (
            <div className="space-y-2">
              {stats.topGenres.map(g => (
                <div key={g.genre} className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400 w-24 truncate">{g.genre}</span>
                  <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                    <div className="h-full bg-blue-500 rounded transition-all"
                      style={{ width: `${(g.count / maxGenreCount) * 100}%` }} />
                  </div>
                  <span className="text-sm text-zinc-500 w-6 text-right">{g.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
