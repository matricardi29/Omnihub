
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Sparkles, BrainCircuit, 
  ShoppingBag, Coins, Play, Trophy, XCircle, Heart
} from 'lucide-react';
import { getGameStrategy } from '../../services/geminiService';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  label: string;
}

interface Joker {
  id: string;
  name: string;
  description: string;
  effect: (hand: Card[], score: { chips: number; mult: number }) => { chips: number; mult: number };
  cost: number;
}

const SUIT_ICONS: Record<Suit, string> = {
  hearts: '♥️',
  diamonds: '♦️',
  clubs: '♣️',
  spades: '♠️',
};

const RANK_LABELS: Record<number, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};

const HAND_TYPES = [
  { name: 'High Card', chips: 5, mult: 1 },
  { name: 'Pair', chips: 10, mult: 2 },
  { name: 'Two Pair', chips: 20, mult: 2 },
  { name: 'Three of a Kind', chips: 30, mult: 3 },
  { name: 'Straight', chips: 40, mult: 4 },
  { name: 'Flush', chips: 35, mult: 4 },
  { name: 'Full House', chips: 40, mult: 4 },
  { name: 'Four of a Kind', chips: 60, mult: 7 },
  { name: 'Straight Flush', chips: 100, mult: 8 },
];

const AVAILABLE_JOKERS: Joker[] = [
  { 
    id: 'j1', name: 'Gros Michel', cost: 4, description: '+4 Mult',
    effect: (h, s) => ({ ...s, mult: s.mult + 4 }) 
  },
  { 
    id: 'j2', name: 'Blue Joker', cost: 6, description: '+20 Chips',
    effect: (h, s) => ({ ...s, chips: s.chips + 20 }) 
  },
  { 
    id: 'j3', name: 'Droll Joker', cost: 5, description: 'x1.5 Mult if Pair',
    effect: (h, s) => {
      const isPair = h.some((c, i) => h.some((c2, i2) => i !== i2 && c.rank === c2.rank));
      return isPair ? { ...s, mult: s.mult * 1.5 } : s;
    } 
  },
  {
    id: 'j4', name: 'Half Joker', cost: 3, description: '+10 Mult if 3 or fewer cards',
    effect: (h, s) => h.length <= 3 ? { ...s, mult: s.mult + 10 } : s
  }
];

const PokerRoguelike: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Game States
  const [gameState, setGameState] = useState<'playing' | 'shop' | 'gameover'>('playing');
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [jokers, setJokers] = useState<Joker[]>([]);
  const [money, setMoney] = useState(10);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(300);
  const [handsLeft, setHandsLeft] = useState(4);
  const [discardsLeft, setDiscardsLeft] = useState(3);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [lastHand, setLastHand] = useState<{ name: string; score: number } | null>(null);

  const initDeck = () => {
    const newDeck: Card[] = [];
    (['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).forEach(suit => {
      for (let rank = 2; rank <= 14; rank++) {
        newDeck.push({
          id: `${suit}-${rank}`,
          suit,
          rank: rank as Rank,
          label: RANK_LABELS[rank]
        });
      }
    });
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const drawToFull = (currentHand: Card[], currentDeck: Card[]) => {
    const needed = 8 - currentHand.length;
    const drawn = currentDeck.slice(0, needed);
    return { 
      newHand: [...currentHand, ...drawn], 
      newDeck: currentDeck.slice(needed) 
    };
  };

  useEffect(() => {
    const d = initDeck();
    const { newHand, newDeck } = drawToFull([], d);
    setHand(newHand);
    setDeck(newDeck);
  }, []);

  const evaluateHand = (selectedCards: Card[]) => {
    const sorted = [...selectedCards].sort((a, b) => a.rank - b.rank);
    const ranks = sorted.map(c => c.rank);
    const suits = sorted.map(c => c.suit);
    const isFlush = new Set(suits).size === 1 && selectedCards.length === 5;
    
    let isStraight = false;
    if (selectedCards.length === 5) {
      isStraight = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1);
      if (!isStraight && ranks.join(',') === '2,3,4,5,14') isStraight = true; // Ace low
    }

    const counts: Record<number, number> = {};
    ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
    const countValues = Object.values(counts).sort((a, b) => b - a);

    if (isStraight && isFlush) return HAND_TYPES[8];
    if (countValues[0] === 4) return HAND_TYPES[7];
    if (countValues[0] === 3 && countValues[1] === 2) return HAND_TYPES[6];
    if (isFlush) return HAND_TYPES[5];
    if (isStraight) return HAND_TYPES[4];
    if (countValues[0] === 3) return HAND_TYPES[3];
    if (countValues[0] === 2 && countValues[1] === 2) return HAND_TYPES[2];
    if (countValues[0] === 2) return HAND_TYPES[1];
    return HAND_TYPES[0];
  };

  const playHand = () => {
    if (selected.length === 0) return;
    const selectedCards = hand.filter(c => selected.includes(c.id));
    const handType = evaluateHand(selectedCards);
    
    let finalStats = { chips: handType.chips, mult: handType.mult };
    jokers.forEach(j => {
      finalStats = j.effect(selectedCards, finalStats);
    });

    const handScore = Math.floor(finalStats.chips * finalStats.mult);
    const newScore = score + handScore;
    
    setScore(newScore);
    setLastHand({ name: handType.name, score: handScore });
    setHandsLeft(h => h - 1);
    
    const remainingHand = hand.filter(c => !selected.includes(c.id));
    const { newHand, newDeck } = drawToFull(remainingHand, deck);
    setHand(newHand);
    setDeck(newDeck);
    setSelected([]);

    if (newScore >= targetScore) {
      setGameState('shop');
    } else if (handsLeft <= 1) {
      setGameState('gameover');
    }
  };

  const discardSelected = () => {
    if (selected.length === 0 || discardsLeft <= 0) return;
    setDiscardsLeft(d => d - 1);
    const remainingHand = hand.filter(c => !selected.includes(c.id));
    const { newHand, newDeck } = drawToFull(remainingHand, deck);
    setHand(newHand);
    setDeck(newDeck);
    setSelected([]);
  };

  const handleAiStrategy = async () => {
    setAiTip(await getGameStrategy('Omni-Balatro', { hand, selected, jokers, score, targetScore }));
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setScore(0);
    setTargetScore(Math.floor(targetScore * 1.5));
    setHandsLeft(4);
    setDiscardsLeft(3);
    setDeck(initDeck());
    const { newHand, newDeck } = drawToFull([], initDeck());
    setHand(newHand);
    setDeck(newDeck);
    setGameState('playing');
    setLastHand(null);
  };

  const buyJoker = (joker: Joker) => {
    if (money >= joker.cost && jokers.length < 5) {
      setMoney(money - joker.cost);
      setJokers([...jokers, joker]);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 max-w-lg mx-auto overflow-x-hidden">
      <header className="flex items-center gap-4 pr-16">
        <button onClick={() => navigate('/games')} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white leading-none">Omni-Balatro</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Ante {round} • Blind Small</p>
        </div>
      </header>

      {gameState === 'playing' && (
        <>
          {/* Dashboard Superior */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Play size={40} /></div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Puntuación</p>
                <p className="text-2xl font-black tabular-nums text-red-500">{score.toLocaleString()} / {targetScore.toLocaleString()}</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                   <div className="bg-red-500 h-full transition-all duration-700" style={{ width: `${Math.min(100, (score/targetScore)*100)}%` }} />
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center">
                <div className="flex gap-4 w-full">
                   <div className="flex-1 text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Manos</p>
                      <p className="text-xl font-black text-blue-500">{handsLeft}</p>
                   </div>
                   <div className="flex-1 text-center border-l border-slate-100 dark:border-white/5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Descartes</p>
                      <p className="text-xl font-black text-red-500">{discardsLeft}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Jokers */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {jokers.map((j, i) => (
              <div key={i} className="flex-none w-20 h-28 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl border border-white/20 p-2 shadow-lg flex flex-col justify-between text-white relative">
                <p className="text-[8px] font-black uppercase tracking-tighter leading-tight">{j.name}</p>
                <div className="text-[6px] opacity-70 font-bold leading-none">{j.description}</div>
                <div className="absolute bottom-1 right-1"><Sparkles size={8} /></div>
              </div>
            ))}
            {jokers.length === 0 && (
              <div className="flex-1 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl h-28 flex items-center justify-center opacity-30 italic text-[10px]">
                No tienes Jokers aún
              </div>
            )}
          </div>

          {/* Mano de Cartas */}
          <div className="bg-emerald-900/10 dark:bg-emerald-900/20 border border-emerald-500/20 rounded-[3rem] p-6 shadow-inner min-h-[300px] flex flex-col items-center justify-center gap-4 relative">
             {lastHand && (
                <div className="absolute top-4 bg-white dark:bg-slate-800 px-4 py-1 rounded-full text-[10px] font-black text-red-500 shadow-xl border border-red-500/20 animate-bounce">
                  {lastHand.name} (+{lastHand.score})
                </div>
             )}
             
             <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                {hand.map((card) => {
                  const isSelected = selected.includes(card.id);
                  return (
                    <button 
                      key={card.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelected(selected.filter(id => id !== card.id));
                        } else if (selected.length < 5) {
                          setSelected([...selected, card.id]);
                        }
                      }}
                      className={`w-14 h-20 rounded-lg flex flex-col items-center justify-between p-2 text-sm font-black transition-all transform shadow-md ${
                        isSelected 
                        ? 'bg-white text-indigo-600 -translate-y-4 shadow-xl ring-2 ring-indigo-500 scale-110' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                      }`}
                    >
                      <span className="self-start text-[10px]">{card.label}</span>
                      <span className={`text-xl ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {SUIT_ICONS[card.suit]}
                      </span>
                      <span className="self-end text-[10px] rotate-180">{card.label}</span>
                    </button>
                  );
                })}
             </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={playHand}
                disabled={selected.length === 0}
                className="py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-20"
             >
               Jugar Mano
             </button>
             <button 
                onClick={discardSelected}
                disabled={selected.length === 0 || discardsLeft === 0}
                className="py-5 bg-red-600 hover:bg-red-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-red-600/30 active:scale-95 transition-all disabled:opacity-20"
             >
               Descartar
             </button>
          </div>
        </>
      )}

      {gameState === 'shop' && (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
           <div className="bg-amber-500 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <ShoppingBag size={120} className="absolute -right-8 -bottom-8 opacity-10" />
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Ronda Completa</p>
                 <h3 className="text-4xl font-black leading-none">LA TIENDA</h3>
                 <div className="mt-6 flex items-center gap-2 bg-black/20 w-fit px-4 py-2 rounded-full border border-white/20">
                    <Coins className="text-yellow-300" size={20} />
                    <span className="text-xl font-black">${money}</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              {AVAILABLE_JOKERS.map(j => (
                <button 
                  key={j.id} 
                  onClick={() => buyJoker(j)}
                  disabled={money < j.cost || jokers.length >= 5}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 text-left flex flex-col justify-between shadow-sm active:scale-95 transition-all disabled:opacity-30 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500">Joker</span>
                       <span className="text-xs font-black text-yellow-600 group-hover:scale-110 transition-transform">${j.cost}</span>
                    </div>
                    <h4 className="font-black text-sm uppercase leading-tight mb-1">{j.name}</h4>
                    <p className="text-[9px] font-medium text-slate-500 italic">{j.description}</p>
                  </div>
                </button>
              ))}
           </div>

           <button 
              onClick={nextRound}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 uppercase tracking-tighter transition-all active:scale-95"
           >
             Siguiente Ronda <ChevronRight size={24} />
           </button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="space-y-8 animate-in fade-in duration-500 py-12 text-center">
           <div className="w-24 h-24 bg-red-100 dark:bg-red-950 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner mb-6">
              <XCircle size={64} />
           </div>
           <h3 className="text-5xl font-black tracking-tighter uppercase leading-none italic text-slate-900 dark:text-white">DERROTA</h3>
           <p className="text-slate-500 font-bold text-sm">No alcanzaste la puntuación objetivo en el Ante {round}.</p>
           
           <div className="bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-black uppercase text-slate-400">Record Ante</span>
                 <span className="text-2xl font-black text-indigo-500">{round}</span>
              </div>
           </div>

           <button 
              onClick={() => window.location.reload()}
              className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
           >
             <RefreshCw size={24} /> REINTENTAR
           </button>
        </div>
      )}

      {/* AI Strategy Tooltip */}
      <div className="fixed bottom-20 left-6 right-6 z-[110]">
         <div className="flex justify-center mb-4">
            <button onClick={handleAiStrategy} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl border-b-4 border-indigo-800 active:scale-90 transition-all">
               <BrainCircuit size={14} /> Omni-Strategy AI
            </button>
         </div>
         {aiTip && (
            <div className="p-5 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 flex gap-4">
               <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex-none flex items-center justify-center text-white"><Sparkles size={20} /></div>
               <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">"{aiTip}"</p>
            </div>
         )}
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default PokerRoguelike;
