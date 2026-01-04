
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, Gamepad2, Info } from 'lucide-react';
import Logo from '../ui/Logo';

const GameLobby: React.FC = () => {
  const navigate = useNavigate();

  const games = [
    { 
      id: 'scrabble', 
      name: 'Scrabble Master', 
      desc: 'Validación por IA en tiempo real.',
      icon: '🔠',
      color: 'from-amber-500 to-orange-600',
      players: '2-4 Jug.'
    },
    { 
      id: 'generala', 
      name: 'Generala Pro', 
      desc: 'Clásico juego de dados digital.',
      icon: '🎲',
      color: 'from-blue-500 to-indigo-600',
      players: '1-6 Jug.'
    },
    { 
      id: 'catan', 
      name: 'Catan Sync', 
      desc: 'Estrategia y recursos compartidos.',
      icon: '⛰️',
      color: 'from-emerald-500 to-teal-600',
      players: '3-4 Jug.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-3">
        <Logo size={44} variant="games" />
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Omni-Games</h2>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Multiplayer Arena</p>
        </div>
      </header>

      <div className="space-y-4">
        {games.map((game) => (
          <div 
            key={game.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 shadow-lg active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10`}>
                {game.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-black uppercase tracking-tight">{game.name}</h3>
                  <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-slate-500 uppercase tracking-widest">{game.players}</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-3">{game.desc}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/games/${game.id}/${Math.random().toString(36).substring(7)}`)}
                    className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Plus size={14} /> Jugar Ahora
                  </button>
                  <button className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl">
                    <Info size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-600/5 border border-amber-500/20 rounded-[2rem] p-6 text-center space-y-3">
        <p className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Sincronización Real-Time</p>
        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-400 leading-relaxed">Invita a tus amigos compartiendo el ID de la sala.</p>
      </div>
    </div>
  );
};

export default GameLobby;
