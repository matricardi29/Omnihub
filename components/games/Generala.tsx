
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dices, RefreshCw, Trophy, Send, BrainCircuit, ArrowLeft, ClipboardList, Gamepad2, CheckCircle2 } from 'lucide-react';
import { getGameStrategy } from '../../services/geminiService';

const CATEGORIES = [
  { id: '1', label: '1', bonus: 0 }, { id: '2', label: '2', bonus: 0 }, 
  { id: '3', label: '3', bonus: 0 }, { id: '4', label: '4', bonus: 0 },
  { id: '5', label: '5', bonus: 0 }, { id: '6', label: '6', bonus: 0 },
  { id: 'escalera', label: 'Escalera', bonus: 20 }, { id: 'full', label: 'Full', bonus: 30 },
  { id: 'poker', label: 'Poker', bonus: 40 }, { id: 'generala', label: 'Generala', bonus: 50 },
  { id: 'generala2', label: 'Doble Gen', bonus: 100 }
];

const Generala: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playMode, setPlayMode] = useState<'digital' | 'tracker'>('digital');
  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rolling, setRolling] = useState(false);
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [aiTip, setAiTip] = useState<string | null>(null);

  const rollDice = () => {
    setRolling(true);
    setTimeout(() => {
      setDice(dice.map((d, i) => held[i] ? d : Math.floor(Math.random() * 6) + 1));
      setRolling(false);
    }, 600);
  };

  const toggleScore = (catId: string) => {
    if (scores[catId] !== undefined) {
       const newScores = {...scores};
       delete newScores[catId];
       setScores(newScores);
       return;
    }
    const val = prompt(`Puntuación para ${catId}:`, "0");
    if (val !== null) setScores({...scores, [catId]: parseInt(val) || 0});
  };

  const totalScore = (Object.values(scores) as (number | null)[]).reduce((acc, v) => acc + (v || 0), 0);

  const handleAiStrategy = async () => {
    setAiTip(await getGameStrategy('Generala', { dice, scores }));
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 pr-16">
        <button onClick={() => navigate('/games')} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">Generala</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Sala #{id?.slice(0,4)}</p>
        </div>
      </header>

      {/* Selector de Modo */}
      <div className="flex bg-slate-200 dark:bg-slate-900/80 p-1.5 rounded-[2rem] border border-slate-300 dark:border-white/5">
        <button 
          onClick={() => setPlayMode('digital')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-xs font-black transition-all ${playMode === 'digital' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          <Gamepad2 size={16} /> JUEGO DIGITAL
        </button>
        <button 
          onClick={() => setPlayMode('tracker')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-xs font-black transition-all ${playMode === 'tracker' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          <ClipboardList size={16} /> ANOTADOR FÍSICO
        </button>
      </div>

      {playMode === 'digital' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 relative">
          <div className="absolute top-6 right-8">
             <button onClick={handleAiStrategy} className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-500/20 active:scale-90 transition-all">
                <BrainCircuit size={18} />
             </button>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {dice.map((d, i) => (
              <button 
                key={i} 
                onClick={() => { const h = [...held]; h[i] = !h[i]; setHeld(h); }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-3xl font-black transition-all transform active:scale-90 shadow-xl ${
                  held[i] ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                } ${rolling && !held[i] ? 'animate-bounce' : ''}`}
              >
                {d}
                {held[i] && <span className="text-[8px] font-black uppercase mt-1 opacity-60">HELD</span>}
              </button>
            ))}
          </div>
          <button 
            onClick={rollDice} 
            disabled={rolling}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <RefreshCw className={rolling ? 'animate-spin' : ''} /> {rolling ? 'LANZANDO...' : 'LANZAR DADOS'}
          </button>
        </div>
      )}

      {/* Tabla de Puntuación */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black flex items-center gap-3 uppercase text-sm tracking-tighter text-slate-400">
            <Trophy size={18} className="text-yellow-500" /> Marcador
          </h3>
          <div className="px-6 py-2 bg-indigo-600 text-white rounded-full font-black text-xl shadow-lg">
            {totalScore} <span className="text-[10px] opacity-60">PTS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => toggleScore(cat.id)}
              className={`flex items-center justify-between p-5 rounded-[1.8rem] border transition-all ${
                scores[cat.id] !== undefined 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-white/5 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${scores[cat.id] !== undefined ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  {scores[cat.id] !== undefined ? <CheckCircle2 size={20} /> : cat.label.charAt(0)}
                </div>
                <span className="font-black text-slate-900 dark:text-slate-300 tracking-widest uppercase text-xs">{cat.label}</span>
              </div>
              <span className={`text-xl font-black ${scores[cat.id] !== undefined ? 'text-emerald-500' : 'text-slate-200'}`}>
                {scores[cat.id] ?? '--'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {aiTip && (
        <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-[2.5rem] animate-in slide-in-from-top-4 flex gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex-none flex items-center justify-center text-white shadow-sm"><Sparkles size={20} /></div>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 italic leading-relaxed">"{aiTip}"</p>
        </div>
      )}
    </div>
  );
};

const Sparkles = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

export default Generala;
