import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  return (
    <div className="text-center pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs tracking-[0.3em] uppercase text-amber mb-4">Page 404 of ∞</p>
        <h1 className="serif text-8xl text-cream mb-4">Lost in the Stacks</h1>
        <p className="text-warm text-lg mb-8 max-w-md mx-auto italic">
          This page doesn't exist. Yet.<br/>
          <span className="text-muted not-italic text-sm">(Or maybe the projector broke. Who's to say.)</span>
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-amber-500 hover:bg-amber-400 px-6 py-3 text-sm font-medium text-[#0a0f1a] transition-all"
        >
          Take me home
        </Link>
      </motion.div>
    </div>
  );
}
