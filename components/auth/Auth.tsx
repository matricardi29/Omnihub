
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import Logo from '../ui/Logo';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#050810] animate-in fade-in duration-700">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <Logo size={64} className="mx-auto" variant="hub" />
          <h1 className="text-4xl font-black tracking-tighter uppercase dark:text-white">
            Omni<span className="text-indigo-600 italic">hub</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Intelligent Ecosystem</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={40} /></div>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Email</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <Mail size={18} className="text-indigo-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="bg-transparent border-0 w-full focus:ring-0 font-bold text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Contraseña</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <Lock size={18} className="text-indigo-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-0 w-full focus:ring-0 font-bold text-sm"
                  required
                />
              </div>
            </div>

            {error && <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-tight">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isSignUp ? 'Crear Cuenta' : 'Entrar'}
            </button>
          </form>
        </div>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
        >
          {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
