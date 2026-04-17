import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { MovieCard } from '../components/MovieCard';
import { MovieCardSkeletonGrid } from '../components/MovieCardSkeleton';

const TMDB_IMG = 'https://image.tmdb.org/t/p';

const EASING = [0.16, 1, 0.3, 1] as [number, number, number, number];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASING } }
};

const MOODS = [
  { emoji: '🌧️', label: 'Rainy Sunday', query: 'cozy feel-good movies for a rainy day' },
  { emoji: '🧠', label: 'Mind-Bending', query: 'mind-bending psychological thrillers with twists' },
  { emoji: '💔', label: 'Good Cry', query: 'heartbreaking emotional drama that makes you cry' },
  { emoji: '🔥', label: 'Date Night', query: 'romantic comedy for date night' },
  { emoji: '🚀', label: 'Sci-Fi Epic', query: 'epic science fiction space adventure' },
  { emoji: '😱', label: 'Scare Me', query: 'terrifying horror thriller with suspense' },
];

export function HomePage() {
  const { data: movies, isLoading } = useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: () => api.browseMovies({ sort: 'rating', limit: 30 }),
  });

  const featured = movies?.[0];
  const staffPicks = movies?.slice(1, 8) || [];
  const restOfMovies = movies?.slice(8) || [];

  return (
    <div className="space-y-20">
      {/* === HERO === */}
      {featured && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative -mx-6 -mt-12 px-6 pt-12 pb-20 overflow-hidden"
        >
          {/* Blurred backdrop */}
          {featured.posterUrl && (
            <div className="absolute inset-0 -z-10">
              <img
                src={`${TMDB_IMG}/w780${featured.posterUrl}`}
                alt=""
                className="w-full h-full object-cover scale-110 blur-2xl opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1a]/80 to-[#0a0f1a]" />
            </div>
          )}

          <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-10 items-center relative z-10 py-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASING }}
              className="md:col-span-2"
            >
              {featured.posterUrl && (
                <Link to={`/movie/${featured.id}`}>
                  <img
                    src={`${TMDB_IMG}/w500${featured.posterUrl}`}
                    alt={featured.title}
                    className="w-full max-w-sm rounded-lg shadow-2xl hover:shadow-amber-500/20 transition-shadow duration-500"
                  />
                </Link>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASING }}
              className="md:col-span-3"
            >
              <p className="text-xs tracking-[0.3em] uppercase text-amber mb-4">Tonight's Feature</p>
              <h1 className="serif text-5xl md:text-6xl text-cream leading-tight mb-4">
                {featured.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-warm mb-6">
                <span>{featured.releaseYear}</span>
                <span className="text-muted">·</span>
                <span className="text-amber">★ {featured.voteAvg}</span>
              </div>
              <Link
                to={`/movie/${featured.id}`}
                className="inline-block rounded-lg bg-amber-500 hover:bg-amber-400 px-6 py-3 text-sm font-medium text-[#0a0f1a] transition-all"
              >
                Enter the story →
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* === MOOD BOARDS === */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6">
          <p className="text-xs tracking-[0.3em] uppercase text-amber mb-2">Set The Mood</p>
          <h2 className="serif text-3xl text-cream">What are you craving?</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOODS.map((mood, i) => (
            <motion.div
              key={mood.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/chat?q=${encodeURIComponent(mood.query)}`}
                className="group block rounded-xl bg-tertiary border border-warm hover:border-amber-500/40 p-5 transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{mood.emoji}</div>
                <p className="serif text-cream group-hover:text-amber-400 transition-colors">{mood.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* === STAFF PICKS CAROUSEL === */}
      {staffPicks.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <p className="text-xs tracking-[0.3em] uppercase text-amber mb-2">Staff Picks</p>
            <h2 className="serif text-3xl text-cream">Tonight's tasting menu</h2>
            <p className="text-warm mt-2">Handpicked. Highly rated. Never boring.</p>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {staffPicks.map(movie => (
              <div key={movie.id} className="flex-shrink-0 w-48 snap-start">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* === REST OF THE COLLECTION === */}
      <section>
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-amber mb-2">The Full Collection</p>
          <h2 className="serif text-3xl text-cream">Explore the archive</h2>
        </div>

        {isLoading && <MovieCardSkeletonGrid count={10} />}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {restOfMovies.map(movie => (
            <motion.div key={movie.id} variants={item}>
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
