
import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Compass, Sparkles, Trash2, Bookmark, Clock, 
  ChevronRight, Landmark, ChefHat, Save, List, ArrowLeft, Plus
} from 'lucide-react';
import { getTravelPlanning } from '../../services/geminiService';
import Logo from '../ui/Logo';

interface SavedPlan {
  id: string;
  destination: string;
  days: number;
  text: string;
  sources: any[];
  timestamp: number;
}

const TravelGuide: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'places' | 'food'>('itinerary');
  const [view, setView] = useState<'dashboard' | 'search' | 'plan'>('dashboard');
  const [currentPlan, setCurrentPlan] = useState<SavedPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    const saved = localStorage.getItem('omni_saved_travels');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('omni_saved_travels', JSON.stringify(savedPlans));
  }, [savedPlans]);

  const handleGenerate = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await getTravelPlanning(destination, days);
      const newPlan: SavedPlan = {
        id: Math.random().toString(36).substring(7),
        destination,
        days,
        text: result.text,
        sources: result.sources,
        timestamp: Date.now()
      };
      setCurrentPlan(newPlan);
      setView('plan');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error
        ? error.message
        : "Error al generar el viaje. Revisa tu conexión.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentPlan = () => {
    if (currentPlan && !savedPlans.find(p => p.id === currentPlan.id)) {
      setSavedPlans([currentPlan, ...savedPlans]);
      setView('dashboard');
      setCurrentPlan(null);
      setDestination('');
    }
  };

  const deletePlan = (id: string) => {
    if (confirm("¿Borrar este itinerario?")) {
      setSavedPlans(savedPlans.filter(p => p.id !== id));
    }
  };

  const getSectionContent = (sectionName: string) => {
    if (!currentPlan) return "";
    const sections = currentPlan.text.split('##');
    const targetSection = sections.find(s => s.toUpperCase().includes(sectionName.toUpperCase()));
    if (!targetSection) return "";
    return targetSection.replace(new RegExp(`${sectionName}`, 'i'), '').trim();
  };

  const parseListItems = (text: string) => {
    return text.split('\n')
      .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
      .map(line => {
        const cleanLine = line.trim().substring(1).trim();
        const parts = cleanLine.split(':');
        return parts.length > 1
          ? { title: parts[0].trim(), description: parts.slice(1).join(':').trim() }
          : { title: cleanLine, description: "" };
      });
  };

  const parseGastronomy = (text: string) => {
    const dishes: { title: string; description: string }[] = [];
    const restaurants: { title: string; description: string }[] = [];

    let mode: 'dishes' | 'restaurants' | null = null;

    const pushLine = (line: string) => {
      const cleanLine = line.trim().replace(/^[*-]\s*/, '');
      if (!cleanLine) return;
      const parts = cleanLine.split(':');
      const entry = parts.length > 1
        ? { title: parts[0].trim(), description: parts.slice(1).join(':').trim() }
        : { title: cleanLine, description: "" };

      if (mode === 'restaurants') {
        restaurants.push(entry);
      } else if (mode === 'dishes') {
        dishes.push(entry);
      }
    };

    text.split('\n').forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;
      const upper = line.toUpperCase();
      if (upper.includes('PLATOS T')) {
        mode = 'dishes';
        return;
      }
      if (upper.includes('RESTAURANTES')) {
        mode = 'restaurants';
        return;
      }
      if (line.startsWith('-') || line.startsWith('*')) {
        pushLine(line);
      }
    });

    return { dishes, restaurants };
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view !== 'dashboard' && (
            <button onClick={() => setView('dashboard')} className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg text-slate-500">
              <ArrowLeft size={14} />
            </button>
          )}
          <Logo size={24} variant="travel" />
          <h2 className="text-sm font-black uppercase tracking-tight">Omni-Travel</h2>
        </div>
        {view === 'dashboard' && (
          <button
            onClick={() => setView('search')}
            className="w-8 h-8 bg-cyan-600 text-white rounded-lg shadow-md shadow-cyan-600/20 flex items-center justify-center active:scale-90 transition-all"
          >
            <Plus size={14} />
          </button>
        )}
      </header>

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-200 rounded-2xl p-4 text-sm font-semibold">
          {errorMessage}
        </div>
      )}

      {view === 'dashboard' && (
        <div className="space-y-5">
          {/* Active Status / Hero for Travel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu próximo destino</p>
                <h3 className="text-base font-black tracking-tight uppercase">Explora el Mundo</h3>
              </div>
              <button
                onClick={() => setView('search')}
                className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-cyan-100 dark:border-cyan-500/20"
              >
                Planear Ahora
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 flex items-center gap-2">
              <Bookmark size={12} /> Itinerarios Guardados ({savedPlans.length})
            </h4>
            
            {savedPlans.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-center text-slate-400">
                <Compass size={22} className="mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No hay planes activos</p>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {savedPlans.map(plan => (
                  <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-3 flex items-center justify-between group active:scale-[0.99] transition-all">
                    <div
                      onClick={() => { setCurrentPlan(plan); setView('plan'); }}
                      className="flex-1 flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-600">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black uppercase tracking-tight leading-none mb-0.5">{plan.destination}</h4>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{plan.days} Días • {new Date(plan.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'search' && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-4 animate-in slide-in-from-bottom-2">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">¿Cuál es el destino?</label>
            <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-white/5">
              <MapPin className="text-cyan-600" size={15} />
              <input
                type="text"
                placeholder="Tokio, Madrid, Lima..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent border-0 w-full focus:ring-0 font-bold text-[13px] placeholder:text-slate-300"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Duración del viaje</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`py-2.5 rounded-xl font-black text-[10px] border transition-all ${days === d ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-white/5 text-slate-500'}`}
                >
                  {d} DÍAS
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!destination.trim() || loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-[10.5px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-30"
          >
            {loading ? <Clock className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {loading ? 'Consultando Mapas...' : 'Trazar Itinerario'}
          </button>
        </section>
      )}

      {view === 'plan' && currentPlan && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2">
          <div className="bg-cyan-600 rounded-2xl p-3.5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                 <p className="text-[9px] font-black uppercase opacity-70 tracking-[0.2em]">{currentPlan.days} DÍAS DE AVENTURA</p>
                 <button onClick={saveCurrentPlan} className="p-1.5 bg-white/20 rounded-md hover:bg-white/30 transition-all">
                    <Save size={14} />
                 </button>
              </div>
              <h3 className="text-lg font-black tracking-tight uppercase leading-none">{currentPlan.destination}</h3>
            </div>
            <MapPin size={54} className="absolute -right-2 -bottom-2 opacity-10" />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-white/5">
            {[
              { id: 'itinerary', icon: Clock, label: 'Itinerario' },
              { id: 'places', icon: Landmark, label: 'Cultura' },
              { id: 'food', icon: ChefHat, label: 'Comida' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white dark:bg-cyan-600 text-cyan-600 dark:text-white shadow-sm' : 'text-slate-500 opacity-60'}`}
              >
                <tab.icon size={12} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 shadow-sm min-h-[240px]">
            {activeTab === 'itinerary' && (
               <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-slate-100 dark:before:bg-white/5">
                 {getSectionContent('ITINERARIO').split('\n').filter(l => l.trim().length > 0).map((line, idx) => {
                   const isDay = line.toLowerCase().includes('día');
                   return (
                     <div key={idx} className="relative pl-6 animate-in slide-in-from-left-2">
                       <div className={`absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center z-10 ${isDay ? 'bg-cyan-600 shadow-md ring-4 ring-white dark:ring-slate-900' : 'bg-slate-200 dark:bg-slate-800'}`} />
                       <p className={isDay ? "text-[13px] font-black text-cyan-600 uppercase" : "text-[10px] font-medium text-slate-600 dark:text-slate-400"}>
                         {line.replace(/^[*-\s]+/, '')}
                       </p>
                     </div>
                   );
                 })}
               </div>
            )}

            {activeTab === 'places' && (
              <div className="space-y-2.5">
                {parseListItems(getSectionContent('ATRACTIVOS')).map((item, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5">
                    <h4 className="text-[11px] font-black text-cyan-700 dark:text-cyan-400 uppercase mb-0.5">{item.title}</h4>
                    {item.description && <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'food' && (() => {
              const gastronomy = parseGastronomy(getSectionContent('GASTRONOMÍA'));
              return (
                <div className="space-y-3.5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.25em]">
                      <ChefHat size={12} className="text-cyan-600" /> Platos típicos
                    </div>
                    {gastronomy.dishes.length === 0 && (
                      <p className="text-[11px] text-slate-400">Sin datos de platos típicos aún.</p>
                    )}
                    <div className="grid gap-1.5">
                      {gastronomy.dishes.map((item, i) => (
                        <div key={i} className="p-3.5 bg-gradient-to-br from-cyan-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 rounded-xl border border-cyan-100 dark:border-white/5">
                          <h4 className="text-[11px] font-black text-cyan-700 dark:text-cyan-400 uppercase mb-0.5">{item.title}</h4>
                          {item.description && <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.25em]">
                      <MapPin size={12} className="text-amber-500" /> Restaurantes recomendados
                    </div>
                    {gastronomy.restaurants.length === 0 && (
                      <p className="text-[11px] text-slate-400">Sin recomendaciones de restaurantes todavía.</p>
                    )}
                    <div className="grid gap-1.5">
                      {gastronomy.restaurants.map((item, i) => (
                        <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-amber-100/60 dark:border-white/5">
                          <h4 className="text-[11px] font-black text-amber-700 dark:text-amber-300 uppercase mb-0.5">{item.title}</h4>
                          {item.description && <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelGuide;
