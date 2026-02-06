
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  owners: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, owners }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // Mock Admin logic
      if (email === 'admin@finpulse.ai' && password === 'admin123') {
        onLogin({ id: '1', email, name: 'Master Admin', role: 'admin', password: 'admin123' });
        return;
      }

      // Mock Owner logic
      const foundOwner = owners.find(o => o.email === email);
      if (foundOwner && foundOwner.password === password) {
        onLogin(foundOwner);
      } else {
        setError('Verification Failed. Credentials Incorrect.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-soft">
            <span className="text-xl font-black">F</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">FinPulse<span className="text-blue-600">.ai</span></h1>
          <p className="text-slate-400 mt-1 font-bold text-sm tracking-tight">Professional SME Intelligence Platform</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authentication Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@enterprise.ai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Token</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold placeholder:text-slate-300"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest shadow-premium active:scale-95 transition-all disabled:opacity-50 text-xs"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Development Sandbox access</p>
            <div className="text-[10px] space-y-1.5 text-slate-500 font-bold">
              <p>Admin: admin@finpulse.ai (admin123)</p>
              <p>Owner: factory@shop.ai (owner123)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
