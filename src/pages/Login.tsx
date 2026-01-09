import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animated-bg">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-3 gradient-text">Welcome Back</h1>
          <p className="text-slate-600">Sign in to your library account</p>
        </div>
        <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-violet-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-violet-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">Sign In</Button>
          </form>
          <p className="text-sm text-slate-500 text-center mt-6">
            Don't have an account? <a href="/signup" className="text-violet-600 font-bold">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}



