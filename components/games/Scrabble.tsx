
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
      <div className="space-y-5 pb-14 animate-in fade-in duration-500">
        <header className="flex items-center gap-2.5">
          <button onClick={() => navigate('/games')} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg shadow-sm">
            <ArrowLeft size={16} className="text-slate-600 dark:text-white" />
          </button>
          <h2 className="text-lg font-black tracking-tight uppercase dark:text-white">Scrabble <span className="text-amber-500 italic">Master</span></h2>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-white">
              <UserPlus size={16} />
              <h3 className="text-[13px] font-black uppercase tracking-tight">Jugadores</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">{players.length} / 6</span>
          </div>

          <div className="flex gap-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5 p-2">
            <input
              type="text"
              placeholder="Nombre..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 bg-transparent border-0 px-2 py-2 font-bold text-[13px] uppercase text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-0"
            />
            <button onClick={addPlayer} className="w-11 h-11 bg-amber-500 text-white rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center">
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {players.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/5">
                <span className="font-black text-[13px] uppercase text-slate-800 dark:text-white">{p.name}</span>
                <button onClick={() => setPlayers(players.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            disabled={players.length === 0}
            onClick={() => setGameStarted(true)}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-black text-[12px] text-white shadow-md active:scale-95 border border-amber-500/40 disabled:opacity-30 transition-all"
          >
            COMENZAR PARTIDA
          </button>
        </div>
      </div>
    );
  }

  const currentPoints = calculateWordPoints();

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-500">
      <header className="flex items-center justify-between pr-10">
        <button onClick={() => setGameStarted(false)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg">
          <ArrowLeft size={16} className="text-slate-600 dark:text-white" />
        </button>
        <div className="bg-[#1f2d24] px-4 py-1.5 rounded-full border-2 border-[#451a03] flex items-center gap-2 shadow-lg">
           <span className="text-lg font-black tabular-nums text-[#fdfcf0]">{Math.floor(seconds/60)}:{(seconds%60).toString().padStart(2,'0')}</span>
           <button onClick={() => setTimerActive(!timerActive)} className="text-amber-400">{timerActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button>
        </div>
      </header>

      {/* Marcador */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
        {players.map((p, i) => (
          <button
            key={i}
            onClick={() => setCurrentPlayerIdx(i)}
            className={`flex-none min-w-[118px] p-3.5 rounded-2xl border-t-2 border-b-6 transition-all relative ${
              currentPlayerIdx === i
              ? 'bg-[#fdfcf0] border-[#d97706] scale-[1.02] z-10 shadow-xl -translate-y-0.5'
              : 'bg-[#fdfcf0]/70 border-transparent opacity-60'
            }`}
          >
            <p className="text-[10px] font-black uppercase text-[#5d3a1a] mb-1">{p.name}</p>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-xl text-[#261e14]">{p.score}</span>
              <span className="text-[9px] font-bold opacity-40 text-[#261e14]">PTS</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tablero de Juego */}
      <div className="bg-[#2e5a32] border-[8px] border-[#451a03] rounded-[2rem] p-5 shadow-2xl space-y-7 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Omni Strategy movido aquí */}
        <div className="absolute top-4 right-6 z-20">
            <button onClick={handleAiStrategy} className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xl border-b-4 border-amber-800 active:scale-90 transition-all">
                <BrainCircuit size={18} />
            </button>
        </div>

        <div className="flex bg-black/25 p-1 rounded-2xl border border-white/5 relative z-10">
          <button onClick={() => setMode('word')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${mode === 'word' ? 'bg-[#d97706] text-white' : 'text-white/50'}`}>TABLERO</button>
          <button onClick={() => setMode('manual')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${mode === 'manual' ? 'bg-[#d97706] text-white' : 'text-white/50'}`}>MANUAL</button>
        </div>

        {mode === 'word' ? (
          <div className="space-y-8 relative z-10">
            <div className="relative pt-2 text-center">
              <input
                type="text"
                placeholder="ESCRIBE..."
                value={word}
                onChange={(e) => handleWordInput(e.target.value)}
                className="w-full bg-transparent border-0 py-4 px-2 font-black text-4xl tracking-[0.18em] text-center text-[#fdfcf0] placeholder:text-white/10 focus:ring-0 uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                {isValidating ? <Loader2 className="animate-spin text-amber-500" /> : wordValidation && (wordValidation.isValid ? <CheckCircle2 className="text-emerald-400" /> : <XCircle className="text-red-500" />)}
              </div>
            </div>

            <div className="relative py-3">
              <div className="absolute -inset-x-6 -bottom-4 h-20 bg-gradient-to-b from-[#78350f] to-[#3a1502] rounded-t-3xl shadow-2xl border-t border-white/10" />
              <div className="relative flex flex-wrap justify-center gap-2">
                {word.split('').map((char, i) => (
                  <button
                    key={i}
                    onClick={() => toggleLetterMult(i)}
                    className={`w-11 h-14 rounded-lg flex flex-col items-center justify-center font-black text-xl shadow-[0_5px_0_rgba(0,0,0,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none ${
                      letterMultipliers[i] === 2 ? 'bg-[#a3d8e5] text-slate-800' :
                      letterMultipliers[i] === 3 ? 'bg-[#007bb0] text-white' :
                      'bg-[#fdfcf0] text-[#261e14]'
                    }`}
                  >
                    <span>{char}</span>
                    <span className="absolute bottom-1 right-1.5 text-[9px] opacity-60">{LETTER_VALUES[char] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setWordMultiplier(wordMultiplier === 2 ? 1 : 2)} className={`py-2.5 rounded-2xl font-black text-[11px] border-b-3 transition-all ${wordMultiplier === 2 ? 'bg-[#f4b8c3] border-[#db2777] text-[#831843]' : 'bg-black/25 border-black/40 text-white/50'}`}>DW (x2 PALABRA)</button>
              <button onClick={() => setWordMultiplier(wordMultiplier === 3 ? 1 : 3)} className={`py-2.5 rounded-2xl font-black text-[11px] border-b-3 transition-all ${wordMultiplier === 3 ? 'bg-[#d51a2a] border-[#991b1b] text-white' : 'bg-black/25 border-black/40 text-white/50'}`}>TW (x3 PALABRA)</button>
            </div>

            <div className="flex justify-center">
              <div className="w-28 h-28 bg-[#fdfcf0] rounded-full flex flex-col items-center justify-center shadow-2xl border-b-8 border-[#d1d5db]">
                <span className="text-4xl font-black text-[#261e14]">{currentPoints}</span>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-[#5d3a1a]">Puntos</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-8 animate-in fade-in">
             <input type="number" placeholder="0" value={manualPoints} onChange={(e) => setManualPoints(e.target.value)} className="w-full bg-transparent border-0 text-center text-[72px] font-black text-amber-500 focus:ring-0 placeholder:text-white/5" />
             <input type="text" placeholder="Concepto..." value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 text-center font-bold text-white focus:ring-0 text-sm" />
          </div>
        )}

        <button
          onClick={submitScore}
          disabled={!currentPoints && !manualPoints}
          className="w-full py-7 bg-[#d97706] hover:bg-[#b45309] rounded-[2.4rem] font-black text-xl text-white shadow-[0_10px_0_rgba(0,0,0,0.3)] border-b-4 border-[#78350f] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-20 uppercase"
        >
          <CheckCircle2 size={24} /> Confirmar
        </button>
      </div>

      {aiTip && (
        <div className="p-6 bg-[#fdfcf0] border-l-8 border-amber-600 rounded-[2rem] shadow-xl animate-in slide-in-from-bottom-4 flex gap-4">
          <div className="w-9 h-9 bg-amber-600 rounded-xl flex-none flex items-center justify-center text-white shadow-sm"><Sparkles size={18} /></div>
          <div>
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1">Omni-Strategy AI</p>
            <p className="text-[#261e14] italic font-medium leading-relaxed">"{aiTip}"</p>
          </div>
        </div>
      )}

      {/* Historial */}
      <section className="bg-[#fdfcf0] border-t-8 border-[#451a03] rounded-[2.4rem] p-6 shadow-2xl space-y-5">
        <h3 className="font-black text-[13px] uppercase text-[#5d3a1a] tracking-widest flex items-center gap-3"><History size={18} /> Historial</h3>
        <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar">
          {players[currentPlayerIdx]?.history.map((h, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border-b-4 border-slate-100 shadow-sm">
              <span className="font-black text-[#261e14] tracking-widest uppercase">{h.word}</span>
              <span className="font-black text-xl text-emerald-600">+{h.points}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Scrabble;
