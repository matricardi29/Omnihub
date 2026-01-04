
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BrainCircuit, Sparkles, Wallet, Landmark, List, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { CompoundInterestConfig } from '../../types';
import { getProductivityAdvice } from '../../services/geminiService';
import Logo from '../ui/Logo';

interface MonthlyData {
  month: number;
  year: number;
  interestEarned: number;
  totalContribution: number;
  balance: number;
}

const InterestCalculator: React.FC = () => {
  // Utilizamos un estado interno que permite strings para que el input pueda estar vacío mientras se edita
  const [config, setConfig] = useState<Record<string, number | string>>({
    principal: 1000,
    rate: 7,
    years: 5,
    frequency: 12,
    monthlyContribution: 100
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  // Helper para obtener el valor numérico seguro para los cálculos
  const getNum = (val: number | string): number => {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(n) ? 0 : n;
  };

  const { monthlyData, yearlyData } = useMemo(() => {
    const mData: MonthlyData[] = [];
    const yData: { year: number; balance: number; label: string }[] = [];
    
    const principal = getNum(config.principal);
    const rate = getNum(config.rate);
    const years = getNum(config.years);
    const monthlyContribution = getNum(config.monthlyContribution);

    let currentBalance = principal;
    let totalContribution = principal;
    const monthlyRate = (rate / 100) / 12;

    yData.push({ year: 0, balance: Math.round(currentBalance), label: 'Y0' });

    for (let year = 1; year <= years; year++) {
      for (let month = 1; month <= 12; month++) {
        const interest = currentBalance * monthlyRate;
        currentBalance += interest + monthlyContribution;
        totalContribution += monthlyContribution;

        mData.push({
          month,
          year,
          interestEarned: interest,
          totalContribution,
          balance: currentBalance
        });
      }
      yData.push({ year, balance: Math.round(currentBalance), label: `Y${year}` });
    }

    return { monthlyData: mData, yearlyData: yData };
  }, [config]);

  const totalInterest = monthlyData.reduce((acc, curr) => acc + curr.interestEarned, 0);

  const handleInputChange = (key: string, value: string) => {
    // Si el valor es vacío, lo guardamos como string vacío para que el input se vea vacío
    if (value === '') {
      setConfig(prev => ({ ...prev, [key]: '' }));
    } else {
      // Intentamos parsear a número pero mantenemos el string si es necesario para la UI
      setConfig(prev => ({ ...prev, [key]: value }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <header className="flex items-center justify-between pr-16"> {/* Padding right para no chocar con el ThemeToggle */}
        <div className="flex items-center gap-2.5">
          <Logo size={32} variant="finance" />
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight leading-tight">Omni-Finance</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Gestión de Capital</p>
          </div>
        </div>
      </header>

      {/* Hero Financial Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* View Switcher reubicado aquí para que no choque con el ThemeToggle global */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md rounded-xl p-1 border border-slate-200 dark:border-white/10 shadow-sm">
            <button 
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'chart' ? 'bg-white dark:bg-emerald-600 shadow-sm text-emerald-600 dark:text-white' : 'text-slate-400'}`}
            >
              <BarChart3 size={14} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-emerald-600 shadow-sm text-emerald-600 dark:text-white' : 'text-slate-400'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        <div className="text-center relative z-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Final Estimado</p>
          <p className="text-4xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white">
            {yearlyData[yearlyData.length - 1].balance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full text-[9px] uppercase border border-emerald-100 dark:border-emerald-500/20">
            <TrendingUp size={10} /> +{totalInterest.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} en intereses
          </div>
        </div>

        {viewMode === 'chart' ? (
          <div className="h-52 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ bottom: 20 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fontWeight: 800, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString('de-DE') + ' €', 'Balance']}
                  labelFormatter={(label) => `Hito: ${label}`}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: 'white' }} 
                />
                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-2 pt-2 max-h-[220px] overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-3 text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
              <span>Año</span>
              <span className="text-center">Int. Ganado</span>
              <span className="text-right">Balance</span>
            </div>
            {Array.from({ length: getNum(config.years) }, (_, i) => i + 1).map(year => {
              const yearData = monthlyData.filter(d => d.year === year);
              const yearInterest = yearData.reduce((acc, curr) => acc + curr.interestEarned, 0);
              const isExpanded = expandedYear === year;
              
              return (
                <div key={year} className="space-y-1">
                  <button 
                    onClick={() => setExpandedYear(isExpanded ? null : year)}
                    className={`w-full grid grid-cols-3 items-center p-3 rounded-xl transition-all border ${isExpanded ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-950/50 border-transparent'}`}
                  >
                    <span className="text-[10px] font-bold text-slate-900 dark:text-slate-300">Año {year}</span>
                    <span className="text-[10px] font-black text-emerald-600 text-center">+{yearInterest.toLocaleString('de-DE', { maximumFractionDigits: 0 })}€</span>
                    <div className="flex items-center justify-end gap-1 text-slate-400">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white">{yearlyData[year]?.balance.toLocaleString('de-DE')}€</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 py-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                      {yearData.map(m => (
                        <div key={m.month} className="grid grid-cols-3 text-[9px] font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 py-1">
                          <span>Mes {m.month}</span>
                          <span className="text-center">+{m.interestEarned.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                          <span className="text-right">{m.balance.toLocaleString('de-DE', { maximumFractionDigits: 0 })}€</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Capital Inicial', key: 'principal', icon: Wallet, color: 'text-indigo-500', suffix: '€' },
          { label: 'Aporte Mensual', key: 'monthlyContribution', icon: Landmark, color: 'text-emerald-500', suffix: '€' },
          { label: 'Tasa Anual %', key: 'rate', icon: TrendingUp, color: 'text-amber-500', suffix: '%' },
          { label: 'Plazo (Años)', key: 'years', icon: Sparkles, color: 'text-purple-500', suffix: 'Y' },
        ].map((f) => (
          <div key={f.key} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm active:scale-[0.98] transition-all">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <f.icon size={10} className={f.color} /> {f.label}
            </label>
            <div className="flex items-baseline gap-1">
              <input 
                type="number" 
                value={config[f.key]}
                onChange={(e) => handleInputChange(f.key, e.target.value)}
                placeholder="0"
                className="w-full bg-transparent border-0 p-0 text-lg font-black focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
              />
              <span className="text-[10px] font-black opacity-30">{f.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={async () => setAiAnalysis(await getProductivityAdvice(config as any))}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
      >
        <BrainCircuit size={16} /> Analizar con Omni-Finance AI
      </button>

      {aiAnalysis && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl animate-in slide-in-from-bottom-2 flex gap-4">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex-none flex items-center justify-center text-white shadow-sm"><Sparkles size={18} /></div>
          <div>
            <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Omni-Finance Expert</p>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">"{aiAnalysis}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestCalculator;
