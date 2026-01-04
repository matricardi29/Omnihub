
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Play, Pause, RotateCcw, 
  CheckCircle2, Trophy, Trash2, BrainCircuit, Sparkles,
  UserPlus, History, Loader2, XCircle, Hash
} from 'lucide-react';
import { getGameStrategy, validateScrabbleWord } from '../../services/geminiService';

interface Player {
  name: string;
  score: number;
  history: { word: string; points: number }[];
}

const LETTER_VALUES: Record<string, number> = {
  'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8, 'L': 1, 'M': 3, 'N': 1, 'Ñ': 8, 'O': 1, 'P': 3, 'Q': 5, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'X': 8, 'Y': 4, 'Z': 10
};

const Scrabble: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [mode, setMode] = useState<'word' | 'manual'>('word');
  
  const [word, setWord] = useState('');
  const [letterMultipliers, setLetterMultipliers] = useState<number[]>([]);
  const [wordMultiplier, setWordMultiplier] = useState(1);
  const [manualPoints, setManualPoints] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [wordValidation, setWordValidation] = useState<{ isValid: boolean; reason?: string } | null>(null);
  const [seconds, setSeconds] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, seconds]);

  useEffect(() => {
    if (!word || word.length < 2) {
      setWordValidation(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsValidating(true);
      const result = await validateScrabbleWord(word);
      setWordValidation(result);
      setIsValidating(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [word]);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, { name: newPlayerName.trim(), score: 0, history: [] }]);
      setNewPlayerName('');
    }
  };

  const calculateWordPoints = () => {
    let total = 0;
    word.toUpperCase().split('').forEach((char, i) => {
      const val = LETTER_VALUES[char] || 0;
      total += val * (letterMultipliers[i] || 1);
    });
    return total * wordMultiplier;
  };

  const handleWordInput = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-ZÑ]/g, '');
    setWord(cleaned);
    setLetterMultipliers(new Array(cleaned.length).fill(1));
  };

  const toggleLetterMult = (idx: number) => {
    const newMults = [...letterMultipliers];
    newMults[idx] = newMults[idx] === 3 ? 1 : newMults[idx] + 1;
    setLetterMultipliers(newMults);
  };

  const submitScore = () => {
    const points = mode === 'word' ? calculateWordPoints() : parseInt(manualPoints) || 0;
    const desc = mode === 'word' ? word : manualDesc || 'Ajuste';
    if (points === 0 && !word && mode === 'word') return;

    const newPlayers = [...players];
    newPlayers[currentPlayerIdx].score += points;
    newPlayers[currentPlayerIdx].history.unshift({ word: desc, points });
    setPlayers(newPlayers);
    setWord('');
    setManualPoints('');
    setManualDesc('');
    setWordMultiplier(1);
    setSeconds(120);
    setWordValidation(null);
  };

  const handleAiStrategy = async () => {
    setAiTip(await getGameStrategy('Scrabble', { players, word }));
  };

  if (!gameStarted) {
    return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        <header className="flex items-center gap-4 pr-16">
          <button onClick={() => navigate('/games')} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm">
            <ArrowLeft size={20} className="text-slate-600 dark:text-white" />
          </button>
          <h2 className="text-2xl font-black tracking-tighter uppercase dark:text-white">Scrabble <span className="text-amber-500 italic">Master</span></h2>
        </header>

        <div className="bg-[#1a2e1c] border-[12px] border-[#451a03] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-[#fdfcf0]"><UserPlus size={20} /> Jugadores</h3>
          <div className="flex gap-2 mb-8 bg-black/30 p-2 rounded-2xl border border-white/5">
            <input 
              type="text" 
              placeholder="Nombre..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 bg-transparent border-0 px-4 py-4 font-bold text-white placeholder:text-white/20 focus:ring-0 uppercase"
            />
            <button onClick={addPlayer} className="w-14 h-14 bg-[#d97706] text-white rounded-xl shadow-lg border-b-4 border-[#78350f] active:scale-90 transition-all flex items-center justify-center">
              <Plus size={24} />
            </button>
          </div>
          <div className="space-y-3 mb-10 max-h-60 overflow-y-auto no-scrollbar">
            {players.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-[#fdfcf0] rounded-2xl border-b-4 border-[#d1d5db] transform hover:-translate-y-1 transition-all">
                <span className="font-black text-lg uppercase text-[#261e14]">{p.name}</span>
                <button onClick={() => setPlayers(players.filter((_, idx) => idx !== i))} className="p-2 text-red-600"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
          <button 
            disabled={players.length === 0}
            onClick={() => setGameStarted(true)}
            className="w-full py-6 bg-[#d97706] hover:bg-[#b45309] rounded-[2rem] font-black text-xl text-white shadow-xl border-b-4 border-[#78350f] disabled:opacity-30 transition-all"
          >
            COMENZAR
          </button>
        </div>
      </div>
    );
  }

  const currentPoints = calculateWordPoints();

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-500">
      <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 px-5 py-4 rounded-3xl shadow-lg border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <button onClick={() => setGameStarted(false)} className="p-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur text-white hover:bg-white/20 transition">
            <ArrowLeft size={20} />
          </button>
          <div className="text-white">
            <p className="text-xs uppercase font-black tracking-widest opacity-60">Modo</p>
            <p className="text-lg font-black flex items-center gap-2"><Trophy size={16} /> Scrabble Arena</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Hash size={16} className="opacity-70" />
            <span className="text-sm uppercase tracking-widest font-bold opacity-70">Ronda</span>
            <span className="text-lg font-black">{players.length ? currentPlayerIdx + 1 : 0}</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="bg-[#fdfcf0] text-[#1a2e1c] px-4 py-2 rounded-xl border-4 border-[#451a03] flex items-center gap-3 shadow-xl">
            <span className="text-2xl font-black tabular-nums">{Math.floor(seconds/60)}:{(seconds%60).toString().padStart(2,'0')}</span>
            <button onClick={() => setTimerActive(!timerActive)} className="text-amber-700">{timerActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
          </div>
        </div>
      </header>

      <div className="grid xl:grid-cols-[1.05fr,1.3fr,1fr] gap-6 items-start">
        <section className="bg-gradient-to-b from-[#0f172a] to-[#111827] text-white rounded-3xl p-6 shadow-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Equipo</p>
              <h3 className="text-xl font-black tracking-tight">Marcador</h3>
            </div>
            <button onClick={handleAiStrategy} className="p-3 bg-amber-500 text-[#1f2937] rounded-2xl shadow-lg border-b-4 border-amber-700 active:translate-y-1 transition-all"><BrainCircuit size={18} /></button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-1 gap-3">
            {players.map((p, i) => (
              <button
                key={i}
                onClick={() => setCurrentPlayerIdx(i)}
                className={`group text-left rounded-2xl p-4 border transition-all duration-200 ${
                  currentPlayerIdx === i
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-emerald-500/30 shadow-lg scale-[1.02]'
                  : 'bg-white/5 border-white/10 hover:border-emerald-300/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.25em] font-black text-white/60">{p.name}</p>
                  <span className="text-[10px] text-white/50">Turno {i + 1}</span>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{p.score}</span>
                    <span className="text-xs font-black text-white/50">PTS</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-200 bg-emerald-500/20 px-3 py-1 rounded-full">{p.history.length} jugadas</div>
                </div>
              </button>
            ))}
          </div>

          {aiTip && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] uppercase font-black tracking-[0.25em] text-amber-300 flex items-center gap-2"><Sparkles size={14} /> Sugerencia AI</p>
              <p className="text-sm leading-relaxed text-white/90 italic">{aiTip}</p>
            </div>
          )}
        </section>

        <section className="bg-[#fdfcf0] rounded-[32px] border-4 border-[#451a03] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #d97706 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative p-6 space-y-6">
            <div className="flex bg-[#f4ede1] p-1 rounded-2xl border border-[#e5d5c3]">
              <button onClick={() => setMode('word')} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${mode === 'word' ? 'bg-[#2e5a32] text-white shadow-md' : 'text-[#5d3a1a]'}`}>Tablero</button>
              <button onClick={() => setMode('manual')} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${mode=== 'manual' ? 'bg-[#2e5a32] text-white shadow-md' : 'text-[#5d3a1a]'}`}>Manual</button>
            </div>

            {mode === 'word' ? (
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ESCRIBE"
                    value={word}
                    onChange={(e) => handleWordInput(e.target.value)}
                    className="w-full bg-white border border-[#e5d5c3] rounded-2xl py-4 px-4 font-black text-3xl tracking-[0.2em] text-center text-[#1f2937] placeholder:text-[#cbd5e1] focus:ring-2 focus:ring-[#2e5a32] uppercase"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidating ? <Loader2 className="animate-spin text-amber-600" /> : wordValidation && (wordValidation.isValid ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />)}
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {word.split('').map((char, i) => (
                    <button
                      key={i}
                      onClick={() => toggleLetterMult(i)}
                      className={`relative w-14 h-16 rounded-xl flex flex-col items-center justify-center font-black text-3xl shadow-[0_6px_0_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none ${
                        letterMultipliers[i] === 2 ? 'bg-[#dbeafe] text-slate-800 border border-[#93c5fd]' :
                        letterMultipliers[i] === 3 ? 'bg-[#1e3a8a] text-white border border-[#1d4ed8]' :
                        'bg-white text-[#1f2937] border border-[#e5e7eb]'
                      }`}
                    >
                      <span>{char}</span>
                      <span className="absolute bottom-1 right-2 text-[10px] opacity-60">{LETTER_VALUES[char] || 0}</span>
                      <span className="absolute -top-2 left-1 text-[9px] font-bold text-emerald-700">x{letterMultipliers[i]}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setWordMultiplier(wordMultiplier === 2 ? 1 : 2)} className={`py-3 rounded-2xl font-black text-xs border transition-all ${wordMultiplier === 2 ? 'bg-[#f4b8c3] border-[#db2777] text-[#831843]' : 'bg-white text-[#5d3a1a] border-[#e5d5c3]'}`}>DW (x2 PALABRA)</button>
                  <button onClick={() => setWordMultiplier(wordMultiplier === 3 ? 1 : 3)} className={`py-3 rounded-2xl font-black text-xs border transition-all ${wordMultiplier === 3 ? 'bg-[#d51a2a] border-[#991b1b] text-white' : 'bg-white text-[#5d3a1a] border-[#e5d5c3]'}`}>TW (x3 PALABRA)</button>
                </div>

                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="bg-white rounded-2xl border border-[#e5d5c3] p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#5d3a1a]">Turno</p>
                    <p className="text-3xl font-black text-[#1f2937]">{players[currentPlayerIdx]?.name || '-'} </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between bg-[#2e5a32] text-white rounded-2xl px-4 py-3 shadow-inner border border-emerald-800">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] font-black text-white/70">Puntos de la palabra</p>
                      <p className="text-4xl font-black">{currentPoints}</p>
                    </div>
                    <div className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full">x{wordMultiplier} palabra</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="bg-white rounded-2xl border border-[#e5d5c3] p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#5d3a1a]">Turno</p>
                    <p className="text-xl font-black text-[#1f2937]">{players[currentPlayerIdx]?.name || '-'} </p>
                  </div>
                  <input type="number" placeholder="0" value={manualPoints} onChange={(e) => setManualPoints(e.target.value)} className="col-span-2 bg-white border border-[#e5d5c3] rounded-2xl p-4 text-right text-5xl font-black text-amber-600 focus:ring-2 focus:ring-[#2e5a32]" />
                </div>
                <input type="text" placeholder="Concepto..." value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} className="w-full bg-white border border-[#e5d5c3] rounded-2xl p-4 text-sm font-bold text-[#1f2937] focus:ring-2 focus:ring-[#2e5a32]" />
              </div>
            )}

            <button
              onClick={submitScore}
              disabled={!currentPoints && !manualPoints}
              className="w-full py-4 bg-[#d97706] hover:bg-[#b45309] rounded-2xl font-black text-lg text-white shadow-[0_8px_0_rgba(0,0,0,0.2)] border-b-4 border-[#78350f] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-30"
            >
              <CheckCircle2 size={26} /> Confirmar jugada
            </button>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2"><History size={18} /> Ronda actual</h3>
            <button onClick={() => setPlayers(players.map((p,i) => i === currentPlayerIdx ? { ...p, history: [] } : p))} className="text-xs font-bold text-rose-600 flex items-center gap-1 hover:underline"><Trash2 size={14} /> Limpiar</button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {players[currentPlayerIdx]?.history.length ? players[currentPlayerIdx].history.map((h, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] font-black text-slate-400">Jugada #{i + 1}</p>
                  <p className="font-black text-lg text-slate-800">{h.word}</p>
                </div>
                <span className="font-black text-2xl text-emerald-600">+{h.points}</span>
              </div>
            )) : (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-slate-500 font-medium">Sin jugadas aún</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setSeconds(120)} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition"><RotateCcw size={16} /> Reiniciar reloj</button>
            <button onClick={() => setTimerActive(!timerActive)} className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs transition ${timerActive ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {timerActive ? <Pause size={16} /> : <Play size={16} />} {timerActive ? 'Pausar' : 'Iniciar'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Scrabble;
