import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login, register, error } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (isRegister) {
      await register(email, username, password);
    } else {
      await login(email, password);
    }
    setLoading(false);
    const stored = localStorage.getItem('user');
    if (stored) navigate('/');
  }

  return (
    <div className="mx-auto max-w-md pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-amber mb-3">Members Only</p>
        <h1 className="serif text-4xl text-cream mb-2">
          {isRegister ? 'Join the Table' : 'Welcome Back'}
        </h1>
        <p className="text-warm text-sm">
          {isRegister ? 'Start curating your taste' : 'Your watchlist is waiting'}
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full rounded-lg bg-tertiary border border-warm px-4 py-3 text-sm text-cream placeholder-muted outline-none focus:border-amber-500/40 focus:bg-elevated transition-all"
        />

        {isRegister && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="w-full rounded-lg bg-tertiary border border-warm px-4 py-3 text-sm text-cream placeholder-muted outline-none focus:border-amber-500/40 focus:bg-elevated transition-all"
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full rounded-lg bg-tertiary border border-warm px-4 py-3 text-sm text-cream placeholder-muted outline-none focus:border-amber-500/40 focus:bg-elevated transition-all"
        />

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 py-3 text-sm font-medium text-[#0a0f1a] transition-all cursor-pointer"
        >
          {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
        </button>
      </motion.form>

      <p className="text-center text-sm text-muted mt-6">
        {isRegister ? 'Already a member?' : 'First time here?'}{' '}
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-amber hover:text-amber-400 transition-colors cursor-pointer"
        >
          {isRegister ? 'Sign in' : 'Create account'}
        </button>
      </p>
    </div>
  );
}
