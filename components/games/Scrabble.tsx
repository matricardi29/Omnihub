
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Play, Pause, RotateCcw,
  CheckCircle2, Trophy, Trash2, BrainCircuit, Sparkles,
  UserPlus, History, Loader2, XCircle, Hash, BookOpenText, Info, ShieldCheck
} from 'lucide-react';
import { getGameStrategy, lookupWordMeaning, validateScrabbleWord } from '../../services/geminiService';

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
  const [wordValidation, setWordValidation] = useState<{ isValid: boolean; reason?: string; existsInRAE?: boolean; definition?: string } | null>(null);
  const [meaning, setMeaning] = useState<{ definition: string; example?: string; existsInRAE: boolean } | null>(null);
  const [isFetchingMeaning, setIsFetchingMeaning] = useState(false);
  const [raeError, setRaeError] = useState<string | null>(null);
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
      setMeaning(null);
      setRaeError(null);
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

  const handleMeaningLookup = async () => {
    if (!word) return;
    setIsFetchingMeaning(true);
    setRaeError(null);
    try {
      const result = await lookupWordMeaning(word);
      setMeaning(result);
    } catch (error) {
      setRaeError('No pudimos consultar la RAE. Intenta de nuevo.');
    } finally {
      setIsFetchingMeaning(false);
    }
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
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="flex items-center justify-between pr-16">
        <button onClick={() => setGameStarted(false)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl">
          <ArrowLeft size={20} className="text-slate-600 dark:text-white" />
        </button>
        <div className="bg-[#1a2e1c] px-6 py-2 rounded-full border-4 border-[#451a03] flex items-center gap-4 shadow-xl">
           <span className="text-2xl font-black tabular-nums text-[#fdfcf0]">{Math.floor(seconds/60)}:{(seconds%60).toString().padStart(2,'0')}</span>
           <button onClick={() => setTimerActive(!timerActive)} className="text-amber-500">{timerActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
        </div>
      </header>

      {/* Marcador */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
        {players.map((p, i) => (
          <button 
            key={i}
            onClick={() => setCurrentPlayerIdx(i)}
            className={`flex-none min-w-[140px] p-5 rounded-[2rem] border-t-2 border-b-8 transition-all relative ${
              currentPlayerIdx === i 
              ? 'bg-[#fdfcf0] border-[#d97706] scale-105 z-10 shadow-2xl -translate-y-1' 
              : 'bg-[#fdfcf0]/60 border-transparent opacity-40'
            }`}
          >
            <p className="text-[10px] font-black uppercase text-[#5d3a1a] mb-1">{p.name}</p>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-3xl text-[#261e14]">{p.score}</span>
              <span className="text-[10px] font-bold opacity-40 text-[#261e14]">PTS</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tablero de Juego */}
      <div className="bg-[#2e5a32] border-[12px] border-[#451a03] rounded-[3rem] p-8 shadow-2xl space-y-10 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Omni Strategy movido aquí */}
        <div className="absolute top-6 right-8 z-20">
            <button onClick={handleAiStrategy} className="p-3 bg-amber-600 text-white rounded-2xl shadow-xl border-b-4 border-amber-800 active:scale-90 transition-all">
                <BrainCircuit size={20} />
            </button>
        </div>

        <div className="flex bg-black/30 p-1 rounded-2xl border border-white/5 relative z-10">
          <button onClick={() => setMode('word')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${mode === 'word' ? 'bg-[#d97706] text-white' : 'text-white/40'}`}>TABLERO</button>
          <button onClick={() => setMode('manual')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${mode === 'manual' ? 'bg-[#d97706] text-white' : 'text-white/40'}`}>MANUAL</button>
        </div>

        {mode === 'word' ? (
          <div className="space-y-10 relative z-10">
            <div className="relative pt-4 text-center">
              <input
                type="text"
                placeholder="ESCRIBE..."
                value={word}
                onChange={(e) => handleWordInput(e.target.value)}
                className="w-full bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/10 rounded-[2rem] py-6 px-6 font-black text-5xl tracking-[0.2em] text-center text-[#fdfcf0] placeholder:text-white/20 focus:ring-2 focus:ring-amber-500/60 uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isValidating ? <Loader2 className="animate-spin text-amber-300" /> : wordValidation && (wordValidation.isValid ? <CheckCircle2 className="text-emerald-400" /> : <XCircle className="text-red-400" />)}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-[#fdfcf0] shadow-lg">
                <div className="flex items-center gap-2 text-xs uppercase font-black tracking-widest mb-2">
                  <ShieldCheck size={16} className="text-emerald-300" /> Validez Scrabble
                </div>
                <p className={`font-black text-lg ${wordValidation?.isValid ? 'text-emerald-200' : 'text-red-200'}`}>
                  {wordValidation?.isValid ? 'VÁLIDA' : word ? 'No válida' : 'Sin evaluar'}
                </p>
                <p className="text-sm text-white/70 mt-1 leading-snug">{wordValidation?.reason || 'Usa letras válidas y coloca multiplicadores antes de confirmar.'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-[#fdfcf0] shadow-lg">
                <div className="flex items-center gap-2 text-xs uppercase font-black tracking-widest mb-2">
                  <BookOpenText size={16} className="text-amber-200" /> Registro RAE
                </div>
                <p className={`font-black text-lg ${wordValidation?.existsInRAE ? 'text-amber-200' : 'text-red-200'}`}>
                  {wordValidation?.existsInRAE ? 'Registrada' : word ? 'No figura' : 'Pendiente'}
                </p>
                <p className="text-sm text-white/70 mt-1 leading-snug">{wordValidation?.existsInRAE ? 'Aparece en el diccionario oficial.' : 'Verifica ortografía o consulta definición.'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-200/40 text-amber-50 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs uppercase font-black tracking-widest">
                    <Info size={16} /> Significado
                  </div>
                  <button
                    onClick={handleMeaningLookup}
                    disabled={!word || isFetchingMeaning}
                    className="px-3 py-2 rounded-xl text-[11px] font-black bg-white/15 border border-white/30 hover:bg-white/25 disabled:opacity-30"
                  >
                    {isFetchingMeaning ? 'Buscando…' : 'Consultar'}
                  </button>
                </div>
                {raeError && <p className="text-sm text-red-100">{raeError}</p>}
                {!raeError && (meaning?.definition || wordValidation?.definition) && (
                  <div className="text-sm leading-snug space-y-1">
                    <p className="font-semibold text-white">{meaning?.definition || wordValidation?.definition}</p>
                    {meaning?.example && <p className="text-white/80">Ejemplo: {meaning.example}</p>}
                  </div>
                )}
                {!raeError && !(meaning?.definition || wordValidation?.definition) && (
                  <p className="text-sm text-white/70">Obtén la definición breve directamente desde la RAE con un toque.</p>
                )}
              </div>
            </div>

            <div className="relative py-4">
              <div className="absolute -inset-x-8 -bottom-4 h-24 bg-gradient-to-b from-[#78350f] to-[#3a1502] rounded-t-3xl shadow-2xl border-t border-white/10" />
              <div className="relative flex flex-wrap justify-center gap-3">
                {word.split('').map((char, i) => (
                  <button
                    key={i}
                    onClick={() => toggleLetterMult(i)}
                    className={`w-16 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-3xl shadow-[0_10px_0_rgba(0,0,0,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-1 active:shadow-none ${
                      letterMultipliers[i] === 2 ? 'bg-[#a3d8e5] text-slate-800' :
                      letterMultipliers[i] === 3 ? 'bg-[#007bb0] text-white' :
                      'bg-[#fdfcf0] text-[#261e14]'
                    }`}
                  >
                    <span>{char}</span>
                    <span className="absolute bottom-2 right-3 text-[10px] opacity-60">{LETTER_VALUES[char] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setWordMultiplier(wordMultiplier === 2 ? 1 : 2)} className={`py-4 rounded-2xl font-black text-xs border-b-4 transition-all ${wordMultiplier === 2 ? 'bg-[#f4b8c3] border-[#db2777] text-[#831843]' : 'bg-black/20 border-black/40 text-white/40'}`}>DW (x2 PALABRA)</button>
              <button onClick={() => setWordMultiplier(wordMultiplier === 3 ? 1 : 3)} className={`py-4 rounded-2xl font-black text-xs border-b-4 transition-all ${wordMultiplier === 3 ? 'bg-[#d51a2a] border-[#991b1b] text-white' : 'bg-black/20 border-black/40 text-white/40'}`}>TW (x3 PALABRA)</button>
            </div>

            <div className="flex justify-center">
              <div className="w-32 h-32 bg-[#fdfcf0] rounded-full flex flex-col items-center justify-center shadow-2xl border-b-8 border-[#d1d5db]">
                <span className="text-5xl font-black text-[#261e14]">{currentPoints}</span>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-[#5d3a1a]">Puntos</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 py-10 animate-in fade-in">
             <input type="number" placeholder="0" value={manualPoints} onChange={(e) => setManualPoints(e.target.value)} className="w-full bg-transparent border-0 text-center text-[100px] font-black text-amber-500 focus:ring-0 placeholder:text-white/5" />
             <input type="text" placeholder="Concepto..." value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-3xl p-6 text-center font-bold text-white focus:ring-0" />
          </div>
        )}

        <button 
          onClick={submitScore}
          disabled={!currentPoints && !manualPoints}
          className="w-full py-8 bg-[#d97706] hover:bg-[#b45309] rounded-[3rem] font-black text-2xl text-white shadow-[0_10px_0_rgba(0,0,0,0.3)] border-b-4 border-[#78350f] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-20 uppercase"
        >
          <CheckCircle2 size={32} /> Confirmar
        </button>
      </div>

      {aiTip && (
        <div className="p-8 bg-[#fdfcf0] border-l-8 border-amber-600 rounded-[2.5rem] shadow-xl animate-in slide-in-from-bottom-4 flex gap-4">
          <div className="w-10 h-10 bg-amber-600 rounded-2xl flex-none flex items-center justify-center text-white shadow-sm"><Sparkles size={20} /></div>
          <div>
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1">Omni-Strategy AI</p>
            <p className="text-[#261e14] italic font-medium leading-relaxed">"{aiTip}"</p>
          </div>
        </div>
      )}

      {/* Historial */}
      <section className="bg-[#fdfcf0] border-t-8 border-[#451a03] rounded-[3rem] p-8 shadow-2xl space-y-6">
        <h3 className="font-black text-sm uppercase text-[#5d3a1a] tracking-widest flex items-center gap-3"><History size={20} /> Historial</h3>
        <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar">
          {players[currentPlayerIdx]?.history.map((h, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border-b-4 border-slate-100 shadow-sm">
              <span className="font-black text-[#261e14] tracking-widest uppercase">{h.word}</span>
              <span className="font-black text-2xl text-emerald-600">+{h.points}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Scrabble;
