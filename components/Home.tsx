
import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, TrendingUp, Bell, Clock, Sparkles, Compass, ChevronRight } from 'lucide-react';
import Logo from './ui/Logo';

const Home: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <Logo showText size={28} variant="hub" />
        <button className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 shadow-sm">
          <Bell size={16} />
        </button>
      </header>

      {/* Hero Refinado */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5 blur-[60px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-700 dark:text-indigo-400 font-bold text-[7px] uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles size={8} /> Omni-Engine Active
          </div>
          <h1 className="text-2xl font-black tracking-tight leading-tight">
            Bienvenido al <br /><span className="text-indigo-600 dark:text-indigo-400 italic">Ecosistema Omni</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-medium leading-relaxed max-w-[180px]">
            Tu entorno inteligente para juegos, finanzas y arte con IA.
          </p>
          <Link to="/creative" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
            Abrir Studio <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* Bento Grid Smooth */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/games" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm active:scale-95 transition-all group">
          <div className="w-9 h-9 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-lg flex items-center justify-center mb-3">
            <Gamepad2 size={20} />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-tight">Omni-Games</h4>
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Social Play</span>
        </Link>
        
        <Link to="/travel" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm active:scale-95 transition-all group">
          <div className="w-9 h-9 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg flex items-center justify-center mb-3">
            <Compass size={20} />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-tight">Omni-Travel</h4>
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Smart Guide</span>
        </Link>
      </div>

      <Link to="/productivity" className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-tight">Omni-Finance</h4>
            <p className="text-[7px] font-bold text-slate-400 uppercase">Proyecciones</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-200" />
      </Link>

      {/* Actividad Reciente Smooth */}
      <section className="bg-slate-100/40 dark:bg-slate-950/20 rounded-3xl p-5 border border-slate-200 dark:border-white/5">
        <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-1.5">
          <Clock size={10} /> Reciente
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Destino: Kioto', detail: 'Guía Generada', icon: '🇯🇵' },
            { label: 'Scrabble Match', detail: 'Turno pendiente', icon: '🔠' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
              <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-sm">{activity.icon}</div>
              <div className="flex-1">
                <p className="font-bold text-[10px] uppercase tracking-tight">{activity.label}</p>
                <p className="text-[7px] font-bold text-slate-400 uppercase">{activity.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
