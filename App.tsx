
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, TrendingUp, Sparkles, Compass } from 'lucide-react';
import { supabase, supabaseConfigError } from './lib/supabase';
import Home from './components/Home';
import GameLobby from './components/games/GameLobby';
import Generala from './components/games/Generala';
import Scrabble from './components/games/Scrabble';
import Catan from './components/games/Catan';
import PokerRoguelike from './components/games/PokerRoguelike';
import InterestCalculator from './components/productivity/InterestCalculator';
import ImageStudio from './components/creative/ImageStudio';
import TravelGuide from './components/travel/TravelGuide';
import Settings from './components/profile/Settings';
import Auth from './components/auth/Auth';

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Hub', variant: 'hub' as const },
    { path: '/games', icon: Gamepad2, label: 'Games', variant: 'games' as const },
    { path: '/creative', icon: Sparkles, label: 'Studio', variant: 'studio' as const },
    { path: '/travel', icon: Compass, label: 'Travel', variant: 'travel' as const },
    { path: '/productivity', icon: TrendingUp, label: 'Finance', variant: 'finance' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)] bg-white/85 dark:bg-[#050810]/85 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const colors = {
            hub: 'text-indigo-600 dark:text-indigo-400',
            games: 'text-amber-600 dark:text-amber-500',
            studio: 'text-purple-600 dark:text-purple-400',
            travel: 'text-cyan-600 dark:text-cyan-400',
            finance: 'text-emerald-600 dark:text-emerald-400'
          };

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${isActive ? colors[item.variant] : 'text-slate-400 dark:text-slate-600'}`}
            >
              <item.icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive ? '-translate-y-0.5' : ''} />
              <span className={`text-[8.5px] font-bold mt-1 tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  if (supabaseConfigError || !supabase) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050810] text-slate-900 dark:text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-xl p-6 text-center space-y-3">
          <h1 className="text-2xl font-bold">Configura Supabase</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No se encontraron las variables <code className="font-mono">VITE_SUPABASE_URL</code> y <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>. Añádelas a tu archivo <code className="font-mono">.env</code> y reinicia la app.
          </p>
          <div className="text-left text-xs bg-slate-100/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-1 font-mono">
            <div><span className="font-semibold">VITE_SUPABASE_URL=</span>https://kwdsvylnmcvkglhprekp.supabase.co</div>
            <div><span className="font-semibold">VITE_SUPABASE_ANON_KEY=</span>sb_publishable_ed6BKpgSMqbG3mxcKzGlVA_2iY2HT4l</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-[#050810] text-slate-900 dark:text-white flex flex-col transition-colors duration-500">
        <main className="flex-1 w-full relative pb-16">
          <div className="max-w-sm mx-auto w-full px-4 py-5 page-transition">
            <Routes>
              <Route path="/" element={<Home user={session.user} />} />
              <Route path="/settings" element={<Settings isDark={isDark} toggleTheme={() => setIsDark(!isDark)} user={session.user} />} />
              <Route path="/games" element={<GameLobby />} />
              <Route path="/games/generala/:id" element={<Generala />} />
              <Route path="/games/scrabble/:id" element={<Scrabble />} />
              <Route path="/games/catan/:id" element={<Catan />} />
              <Route path="/games/balatro/:id" element={<PokerRoguelike />} />
              <Route path="/productivity" element={<InterestCalculator />} />
              <Route path="/creative" element={<ImageStudio />} />
              <Route path="/travel" element={<TravelGuide />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
        
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;
