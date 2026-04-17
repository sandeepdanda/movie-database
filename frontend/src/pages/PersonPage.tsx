import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { MovieCard } from '../components/MovieCard';

const EASING = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const { data: person, isLoading } = useQuery({
    queryKey: ['person', id],
    queryFn: () => api.getPerson(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;
  if (!person) {
    return (
      <div className="text-center py-32">
        <p className="serif text-3xl text-cream mb-2">Person not found</p>
        <Link to="/" className="text-amber hover:text-amber-400">← Back to home</Link>
      </div>
    );
  }

  const initials = person.name.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <div>
      <Link to="/" className="text-muted hover:text-cream text-sm inline-block mb-8 transition-colors">
        ← Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-6 mb-12"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-burgundy/20 border border-warm flex items-center justify-center flex-shrink-0">
          <span className="serif text-3xl text-amber">{initials}</span>
        </div>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-amber mb-2">Filmography</p>
          <h1 className="serif text-5xl text-cream">{person.name}</h1>
          <p className="text-warm mt-2">{person.filmography.length} {person.filmography.length === 1 ? 'film' : 'films'}</p>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {person.filmography.map(movie => (
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
    </div>
  );
}
