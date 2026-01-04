
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, LogOut, Shield, Bell, Moon, Sun, User, ChevronRight, Sparkles } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import Logo from '../ui/Logo';

interface SettingsProps {
  isDark: boolean;
  toggleTheme: () => void;
  user: any;
}

const Settings: React.FC<SettingsProps> = ({ isDark, toggleTheme, user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!supabase) {
      navigate('/');
      return;
    }

    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Ajustes</h2>
      </header>

      {/* User Card */}
      <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User size={100} /></div>
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-black backdrop-blur-md border border-white/20">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">{user?.email?.split('@')[0]}</h3>
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Preferencias</h4>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-4 shadow-sm space-y-2">
          {/* Theme Row */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-tight dark:text-white">Modo Oscuro</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">Visualización del sistema</p>
              </div>
            </div>
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>

          {[
            { label: 'Notificaciones', icon: Bell, detail: 'Alertas y avisos' },
            { label: 'Seguridad', icon: Shield, detail: 'Privacidad de datos' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl flex items-center justify-center">
                  <item.icon size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-tight dark:text-white">{item.label}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">{item.detail}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full py-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] border border-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 mt-8"
      >
        <LogOut size={16} /> Cerrar Sesión
      </button>

      <div className="text-center pt-8">
        <Logo size={24} className="mx-auto opacity-20 mb-2" variant="hub" />
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Omnihub v2.4.0 • Built for Future</p>
      </div>
    </div>
  );
};

export default Settings;
