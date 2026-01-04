
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, HardHat, Map as MapIcon, 
  Boxes, Dices, Sparkles, BrainCircuit, ChevronRight,
  Monitor, Layout
} from 'lucide-react';
import { getGameStrategy } from '../../services/geminiService';

type ResourceType = 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore' | 'desert';

interface Hex {
  id: number;
  resource: ResourceType;
  number: number;
}

const RESOURCE_CONFIG: Record<ResourceType, { icon: string, color: string, name: string }> = {
  wood: { icon: '🌲', color: 'bg-emerald-700', name: 'Madera' },
  brick: { icon: '🧱', color: 'bg-orange-800', name: 'Arcilla' },
  sheep: { icon: '🐑', color: 'bg-lime-500', name: 'Oveja' },
  wheat: { icon: '🌾', color: 'bg-amber-400', name: 'Trigo' },
  ore: { icon: '⛰️', color: 'bg-slate-500', name: 'Piedra' },
  desert: { icon: '🏜️', color: 'bg-yellow-800', name: 'Desierto' },
};

const Catan: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playMode, setPlayMode] = useState<'digital' | 'physical'>('physical');
  const [map, setMap] = useState<Hex[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({ wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 });
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const generateMap = () => {
    const resources: ResourceType[] = ([
      'wood', 'wood', 'wood', 'wood',
      'wheat', 'wheat', 'wheat', 'wheat',
      'sheep', 'sheep', 'sheep', 'sheep',
      'brick', 'brick', 'brick',
      'ore', 'ore', 'ore',
      'desert'
    ] as ResourceType[]).sort(() => Math.random() - 0.5);

    const numbers = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12].sort(() => Math.random() - 0.5);
    
    let numIdx = 0;
    const newMap = resources.map((res, i) => ({
      id: i,
      resource: res,
      number: res === 'desert' ? 0 : numbers[numIdx++]
    }));
    setMap(newMap);
    setAiTip(null);
  };

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      setIsRolling(false);
    }, 600);
  };

  useEffect(() => {
    generateMap();
  }, []);

  const handleAiStrategy = async () => {
    const tip = await getGameStrategy('Catan', { map, inventory, mode: playMode });
    setAiTip(tip);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 pr-16"> {/* pr-16 para evitar el botón de tema */}
        <button onClick={() => navigate('/games')} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm">
          <ArrowLeft size={20} className="text-slate-600 dark:text-white" />
        </button>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">Catan <span className="text-indigo-500 italic">Sync</span></h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sala #{id?.slice(0,4)}</p>
        </div>
      </header>

      {/* Selector de Modo */}
      <div className="flex bg-slate-200 dark:bg-slate-900/80 p-1.5 rounded-[2rem] border border-slate-300 dark:border-white/5">
        <button 
          onClick={() => setPlayMode('physical')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-xs font-black transition-all ${playMode === 'physical' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          <Layout size={16} /> TABLERO FÍSICO
        </button>
        <button 
          onClick={() => setPlayMode('digital')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-xs font-black transition-all ${playMode === 'digital' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          <Monitor size={16} /> DIGITAL SYNC
        </button>
      </div>

      {/* Mapa Procedimental */}
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 shadow-xl overflow-hidden relative ${playMode === 'physical' ? 'min-h-[500px]' : 'min-h-[400px]'}`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
            <MapIcon size={14} className="text-indigo-500" /> Tablero
          </h3>
          <div className="flex items-center gap-2">
            {/* Botón de Estrategia movido aquí */}
            <button 
              onClick={handleAiStrategy}
              className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:scale-110 transition-all border border-indigo-100 dark:border-indigo-500/20"
              title="Obtener Estrategia AI"
            >
              <BrainCircuit size={18} />
            </button>
            <button 
              onClick={generateMap} 
              className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-indigo-500 hover:rotate-180 transition-transform duration-500"
              title="Regenerar Mapa"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        
        <div className={`flex flex-col items-center gap-1 transition-all ${playMode === 'physical' ? 'scale-110 md:scale-125 my-8' : 'scale-90 md:scale-100'}`}>
          {[3, 4, 5, 4, 3].map((count, rowIndex) => {
            const startIdx = [0, 3, 7, 12, 16][rowIndex];
            return (
              <div key={rowIndex} className="flex gap-1">
                {map.slice(startIdx, startIdx + count).map((hex) => (
                  <div 
                    key={hex.id}
                    className={`w-16 h-18 md:w-20 md:h-22 flex flex-col items-center justify-center relative transition-all hover:scale-110 cursor-pointer shadow-lg border border-white/10 ${RESOURCE_CONFIG[hex.resource].color}`}
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                  >
                    <span className="text-xl mb-1 drop-shadow-md">{RESOURCE_CONFIG[hex.resource].icon}</span>
                    {hex.number > 0 && (
                      <div className={`w-8 h-8 bg-white dark:bg-slate-950/90 rounded-full flex items-center justify-center font-black text-[10px] border shadow-sm ${hex.number === 6 || hex.number === 8 ? 'text-red-500 border-red-500' : 'text-slate-900 dark:text-white border-white/20'}`}>
                        {hex.number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        
        {playMode === 'physical' && (
          <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-8 italic">
            Configura tus piezas físicas siguiendo este patrón
          </p>
        )}
      </div>

      {/* Dado Digital y Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dice Roller Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-lg flex flex-col items-center justify-center gap-4">
          <div className="flex gap-4">
            {dice.map((val, i) => (
              <div 
                key={i}
                className={`w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl border-b-4 border-slate-200 dark:border-slate-950 transform transition-all ${isRolling ? 'animate-bounce' : ''}`}
              >
                {val}
              </div>
            ))}
          </div>
          <button 
            onClick={rollDice}
            disabled={isRolling}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Dices size={16} /> {isRolling ? 'Lanzando...' : `Lanzar (${dice[0] + dice[1]})`}
          </button>
        </div>

        {/* Resources or Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-lg">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
            <Boxes size={14} className="text-indigo-500" /> Inventario de Recursos
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(RESOURCE_CONFIG).filter(([k]) => k !== 'desert').map(([key, config]) => (
              <button 
                key={key} 
                onClick={() => setInventory({...inventory, [key]: (inventory[key] || 0) + 1})}
                className="flex flex-col items-center gap-1 group active:scale-90 transition-all"
              >
                <div className={`w-10 h-10 ${config.color} rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:shadow-md transition-shadow`}>
                  {config.icon}
                </div>
                <span className="font-black text-sm text-slate-900 dark:text-white">{inventory[key] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {aiTip && (
        <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-[2.5rem] animate-in slide-in-from-bottom-2 flex gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex-none flex items-center justify-center text-white shadow-sm"><Sparkles size={20} /></div>
          <div>
            <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Omni-Strategy AI</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">"{aiTip}"</p>
          </div>
        </div>
      )}

      {playMode === 'digital' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
            <HardHat size={14} className="text-indigo-500" /> Construcción
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Poblado', cost: '1x🌲 1x🧱 1x🌾 1x🐑', icon: '🏘️' },
              { label: 'Carretera', cost: '1x🌲 1x🧱', icon: '🛣️' },
              { label: 'Ciudad', cost: '3x⛰️ 2x🌾', icon: '🏰' }
            ].map((item, idx) => (
              <button key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{item.label}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{item.cost}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catan;
