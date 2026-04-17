import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login, register, error } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isRegister) {
      await register(email, username, password);
    } else {
      await login(email, password);
    }
    // AuthContext sets user on success, check after
    const stored = localStorage.getItem('user');
    if (stored) navigate('/');
  }

  return (
    <div className="mx-auto max-w-sm pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isRegister ? 'Create Account' : 'Sign In'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          required className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 ring-blue-500" />

        {isRegister && (
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
            required className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 ring-blue-500" />
        )}

        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          required className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 ring-blue-500" />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500 transition">
          {isRegister ? 'Register' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-4">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => setIsRegister(!isRegister)} className="text-blue-400 hover:underline">
          {isRegister ? 'Sign in' : 'Register'}
        </button>
      </p>
    </div>
  );
}
