import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const EASING = [0.16, 1, 0.3, 1] as [number, number, number, number];

function CountUp({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{Math.round(count * 10) / 10}</>;
}

export function StatsPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="text-center py-32">
        <p className="serif text-3xl text-cream mb-3">The vault is locked</p>
        <p className="text-warm">Sign in to see your tasting notes.</p>
      </div>
    );
  }
  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;
  if (!stats) return null;

  const maxRating = Math.max(...Object.values(stats.ratingDistribution), 1);
  const maxGenre = Math.max(...stats.topGenres.map(g => g.count), 1);

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-amber mb-3">Your Tasting Notes</p>
        <h1 className="serif text-5xl text-cream mb-3">
          {user.username}'s Palate
        </h1>
        <p className="text-warm">A curated look at what you love. Earned, one rating at a time.</p>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
      >
        {[
          { value: stats.totalRated, label: 'Movies Rated', accent: 'text-amber', integer: true },
          { value: stats.totalWatchlist, label: 'In Watchlist', accent: 'text-cream', integer: true },
          { value: stats.averageRating, label: 'Average Rating', accent: 'text-amber', suffix: ' ★' },
          { value: stats.achievements.length, label: 'Achievements', accent: 'text-cream', integer: true },
        ].map((card, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASING } }
            }}
            className="rounded-xl bg-tertiary border border-warm p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className={`serif text-5xl ${card.accent} mb-1 relative`}>
              <CountUp value={card.value} />
              {card.suffix}
            </p>
            <p className="text-xs tracking-wider uppercase text-muted relative">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Taste Profile */}
      {(stats.favoriteGenre || stats.favoriteDecade) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-burgundy/10 border border-amber-500/20 p-8"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-amber mb-3">Taste Profile</p>
          <div className="grid md:grid-cols-2 gap-6">
            {stats.favoriteGenre && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Favorite Genre</p>
                <p className="serif text-3xl text-cream">{stats.favoriteGenre}</p>
              </div>
            )}
            {stats.favoriteDecade && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Favorite Era</p>
                <p className="serif text-3xl text-cream">{stats.favoriteDecade}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Rating distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-amber mb-3">How You Rate</p>
          <h2 className="serif text-2xl text-cream mb-6">Rating distribution</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const count = stats.ratingDistribution[star] || 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex gap-0.5 w-20 text-amber text-sm">
                    {Array.from({ length: star }).map((_, i) => <span key={i}>★</span>)}
                  </div>
                  <div className="flex-1 h-7 bg-tertiary rounded-full overflow-hidden border border-warm">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(count / maxRating) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.1 + idx * 0.1, ease: EASING }}
                      className="h-full bg-gradient-to-r from-amber-500/70 to-amber-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-warm w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top genres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-amber mb-3">What You Love</p>
          <h2 className="serif text-2xl text-cream mb-6">Top genres</h2>
          {stats.topGenres.length === 0 ? (
            <p className="text-warm text-sm italic">Rate some movies to see your genre breakdown.</p>
          ) : (
            <div className="space-y-3">
              {stats.topGenres.map((g, idx) => (
                <div key={g.genre} className="flex items-center gap-3">
                  <span className="text-sm serif text-cream w-28 truncate">{g.genre}</span>
                  <div className="flex-1 h-7 bg-tertiary rounded-full overflow-hidden border border-warm">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(g.count / maxGenre) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: EASING }}
                      className="h-full bg-gradient-to-r from-burgundy/60 to-amber-500/60 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-warm w-8 text-right">{g.count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Achievements */}
      {stats.achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-amber mb-3">Your Shelf</p>
          <h2 className="serif text-2xl text-cream mb-6">Achievements earned</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.achievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASING }}
                whileHover={{ y: -4 }}
                className="rounded-xl bg-tertiary border border-warm p-5 hover:border-amber-500/40 transition-all"
              >
                <div className="text-4xl mb-3">{a.icon}</div>
                <p className="serif text-base text-cream mb-1">{a.title}</p>
                <p className="text-xs text-muted">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state encouragement */}
      {stats.totalRated === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="serif text-2xl text-cream mb-2">The cellar awaits</p>
          <p className="text-warm">Rate a few movies and come back. We'll tell you things about yourself you didn't know.</p>
        </motion.div>
      )}
    </div>
  );
}
