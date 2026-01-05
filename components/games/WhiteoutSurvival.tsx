import React, { useEffect, useMemo, useState } from 'react';
import { Flame, Soup, Snowflake, Mountain, Axe, Fish, Compass, HeartPulse, ListChecks, Map } from 'lucide-react';

type Objective = {
  label: string;
  target: number;
  key: keyof Progress;
};

type Progress = {
  wood: number;
  meat: number;
  soups: number;
  scouts: number;
  morale: number;
};

type Level = {
  id: string;
  name: string;
  intro: string;
  map: string[];
  weather: string;
  survivors: number;
  objectives: Objective[];
  startingResources: {
    wood: number;
    meat: number;
    herbs: number;
    heat: number;
    morale: number;
  };
  tips: string[];
};

const levels: Level[] = [
  {
    id: 'tutorial',
    name: 'Campamento helado',
    intro: 'Despiertas junto al generador y necesitas leña y sopa caliente para que nadie caiga en la primera noche.',
    map: [
      'TTTTTT',
      'T..I.T',
      'T.H.I.',
      '..C.I.',
      'B..I.T',
      'TTTTTT'
    ],
    weather: 'Cielo abierto pero -25°C',
    survivors: 10,
    objectives: [
      { label: 'Reunir 20 de leña', target: 20, key: 'wood' },
      { label: 'Cocinar 6 sopas', target: 6, key: 'soups' },
      { label: 'Mantener moral en 60+', target: 60, key: 'morale' }
    ],
    startingResources: { wood: 6, meat: 4, herbs: 2, heat: 60, morale: 70 },
    tips: [
      'Asigna leñadores al inicio, sin calor el grupo se congela.',
      'Usa a los cocineros para convertir carne en sopa antes de que baje la moral.',
      'La moral baja si el calor cae por debajo de 50.'
    ]
  },
  {
    id: 'river',
    name: 'Vado congelado',
    intro: 'El río está congelado y los animales son escasos. Aprovecha las hierbas y pescadores.',
    map: [
      'TTTIIT',
      'T..I.T',
      'F..I.F',
      '.C.I..',
      'T..I.T',
      'TTTIIT'
    ],
    weather: 'Viento cortante, -32°C',
    survivors: 12,
    objectives: [
      { label: 'Reunir 28 de leña', target: 28, key: 'wood' },
      { label: 'Cocinar 10 sopas', target: 10, key: 'soups' },
      { label: 'Enviar 3 exploradores', target: 3, key: 'scouts' }
    ],
    startingResources: { wood: 10, meat: 3, herbs: 5, heat: 55, morale: 68 },
    tips: [
      'El hielo desgasta la moral: mantén calor por encima de 50.',
      'Pesca con cuidado: el río puede romperse después del tercer día.',
      'Enviar exploradores desbloquea rutas y sube moral.'
    ]
  },
  {
    id: 'ridge',
    name: 'Cresta ventisca',
    intro: 'Refuerza la empalizada y raciona. El viento amenaza con apagar el generador.',
    map: [
      'TTMMMM',
      'T..M.T',
      'B..M.B',
      '.C.M..',
      'T..M.T',
      'TTMMMM'
    ],
    weather: 'Tormenta en 2 turnos, -40°C',
    survivors: 14,
    objectives: [
      { label: 'Reunir 35 de leña', target: 35, key: 'wood' },
      { label: 'Cocinar 12 sopas', target: 12, key: 'soups' },
      { label: 'Moral en 75+', target: 75, key: 'morale' }
    ],
    startingResources: { wood: 12, meat: 6, herbs: 3, heat: 60, morale: 72 },
    tips: [
      'Reserva leña antes de la tormenta o perderás calor rápidamente.',
      'Los cazadores vuelven agotados: súbeles la moral con sopa.',
      'Asignar 2 exploradores evita pérdidas por derrumbes.'
    ]
  }
];

type Assignments = {
  woodcutters: number;
  hunters: number;
  cooks: number;
  scouts: number;
  medics: number;
};

const tilePalette: Record<string, { label: string; color: string; icon: string }> = {
  T: { label: 'Bosque', color: 'bg-emerald-100/40 dark:bg-emerald-500/10', icon: '🌲' },
  I: { label: 'Hielo', color: 'bg-cyan-100/50 dark:bg-cyan-500/10', icon: '🧊' },
  B: { label: 'Bestia', color: 'bg-amber-100/60 dark:bg-amber-500/10', icon: '🐻' },
  F: { label: 'Río Helado', color: 'bg-blue-100/60 dark:bg-blue-500/10', icon: '🌊' },
  M: { label: 'Montaña', color: 'bg-slate-200/70 dark:bg-slate-600/20', icon: '⛰️' },
  H: { label: 'Hierbas', color: 'bg-lime-100/60 dark:bg-lime-500/10', icon: '🌿' },
  C: { label: 'Campamento', color: 'bg-indigo-100/70 dark:bg-indigo-500/10', icon: '🏕️' },
  '.': { label: 'Nieve', color: 'bg-white/40 dark:bg-white/5', icon: '❄️' }
};

const defaultAssignments: Assignments = {
  woodcutters: 3,
  hunters: 3,
  cooks: 2,
  scouts: 1,
  medics: 1
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const WhiteoutSurvival: React.FC = () => {
  const [levelId, setLevelId] = useState(levels[0].id);
  const currentLevel = useMemo(() => levels.find((lvl) => lvl.id === levelId) || levels[0], [levelId]);
  const [assignments, setAssignments] = useState<Assignments>(defaultAssignments);
  const [day, setDay] = useState(1);
  const [resources, setResources] = useState({
    wood: currentLevel.startingResources.wood,
    meat: currentLevel.startingResources.meat,
    herbs: currentLevel.startingResources.herbs,
    heat: currentLevel.startingResources.heat,
    morale: currentLevel.startingResources.morale,
    soups: 0,
    scouts: 0
  });
  const [log, setLog] = useState<string[]>([
    'El campamento despierta; las antorchas aún resisten la ventisca.'
  ]);

  const totalAssigned =
    assignments.woodcutters + assignments.hunters + assignments.cooks + assignments.scouts + assignments.medics;
  const available = currentLevel.survivors - totalAssigned;

  useEffect(() => {
    setAssignments(defaultAssignments);
    setDay(1);
    setResources({
      wood: currentLevel.startingResources.wood,
      meat: currentLevel.startingResources.meat,
      herbs: currentLevel.startingResources.herbs,
      heat: currentLevel.startingResources.heat,
      morale: currentLevel.startingResources.morale,
      soups: 0,
      scouts: 0
    });
    setLog([
      `Nuevo escenario: ${currentLevel.name}. ${currentLevel.intro}`
    ]);
  }, [currentLevel]);

  const handleAssignmentChange = (key: keyof Assignments, delta: number) => {
    setAssignments((prev) => {
      const updated = clamp(prev[key] + delta, 0, currentLevel.survivors);
      const next = { ...prev, [key]: updated } as Assignments;
      const assignedCount =
        next.woodcutters + next.hunters + next.cooks + next.scouts + next.medics;
      if (assignedCount > currentLevel.survivors) return prev;
      return next;
    });
  };

  const computeProgress = (): Progress => ({
    wood: resources.wood,
    meat: resources.meat,
    soups: resources.soups,
    scouts: resources.scouts,
    morale: resources.morale
  });

  const objectiveCompletion = currentLevel.objectives.map((obj) => {
    const progress = computeProgress();
    const value = progress[obj.key];
    const pct = clamp((value / obj.target) * 100, 0, 120);
    return { ...obj, value, pct, done: value >= obj.target };
  });

  const runTurn = () => {
    const events: string[] = [];
    const woodGain = assignments.woodcutters * 3 + Math.floor(Math.random() * 2);
    const meatGain = assignments.hunters * 2;
    const herbGain = assignments.scouts > 0 ? Math.min(assignments.scouts, 2) : 0;

    let heat = resources.heat - 6 + assignments.cooks * 2 + resources.soups * 0.1;
    heat = clamp(heat, 0, 100);

    let morale = resources.morale + (resources.soups > 0 ? 2 : -2) + assignments.medics;
    morale = clamp(morale, 0, 100);

    const possibleSoups = Math.min(assignments.cooks, Math.floor(resources.meat / 2));
    const cooked = possibleSoups;

    const scoutsSent = assignments.scouts > 0 ? 1 : 0;

    const deaths = heat < 35 ? 1 : 0;

    events.push(`Día ${day}: la fogata consume calor y los equipos regresan.`);
    if (woodGain) events.push(`+${woodGain} leña recolectada en el bosque.`);
    if (meatGain) events.push(`+${meatGain} carne cazada cerca de la empalizada.`);
    if (herbGain) events.push(`+${herbGain} hierbas útiles encontradas.`);
    if (cooked) events.push(`${cooked} ollas de sopa listas en el caldero.`);
    if (scoutsSent) events.push('Un explorador marcó una ruta segura entre los pinos.');
    if (deaths) events.push('Una persona no soportó el frío. La moral se resiente.');

    setResources((prev) => {
      const next = {
        ...prev,
        wood: prev.wood + woodGain,
        meat: prev.meat + meatGain - cooked * 2,
        herbs: prev.herbs + herbGain,
        soups: prev.soups + cooked,
        scouts: prev.scouts + scoutsSent,
        heat: heat,
        morale: morale - deaths * 8
      };
      return next;
    });

    setLog((prev) => [...events, ...prev].slice(0, 10));
    setDay((prev) => prev + 1);
  };

  const resetLevel = () => {
    setAssignments(defaultAssignments);
    setDay(1);
    setResources({
      wood: currentLevel.startingResources.wood,
      meat: currentLevel.startingResources.meat,
      herbs: currentLevel.startingResources.herbs,
      heat: currentLevel.startingResources.heat,
      morale: currentLevel.startingResources.morale,
      soups: 0,
      scouts: 0
    });
    setLog([
      `Reiniciaste ${currentLevel.name}. Ajusta tus equipos y vuelve a intentarlo.`
    ]);
  };

  const completionRate =
    (objectiveCompletion.filter((obj) => obj.done).length / currentLevel.objectives.length) * 100;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Campaña</p>
          <h1 className="text-xl font-black leading-tight">Whiteout Survival</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Gestiona colonos, calor y comida.</p>
        </div>
        <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20">
          <Snowflake size={20} />
        </div>
      </header>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <Map size={16} className="text-slate-500" />
          <div className="flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Escenario</p>
            <h3 className="text-lg font-black">{currentLevel.name}</h3>
          </div>
          <select
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="text-sm font-semibold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2"
          >
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{currentLevel.intro}</p>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-300">
          <Snowflake size={12} /> {currentLevel.weather}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-amber-500" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Estado</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-bold">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <p className="text-[9px] uppercase text-amber-600 font-black">Calor</p>
              <p className="text-lg">{Math.round(resources.heat)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20">
              <p className="text-[9px] uppercase text-pink-600 font-black">Moral</p>
              <p className="text-lg">{Math.round(resources.morale)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <p className="text-[9px] uppercase text-emerald-700 font-black">Leña</p>
              <p className="text-lg">{resources.wood}</p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
              <p className="text-[9px] uppercase text-rose-600 font-black">Carne</p>
              <p className="text-lg">{resources.meat}</p>
            </div>
            <div className="p-3 rounded-2xl bg-lime-50 dark:bg-lime-500/10 border border-lime-100 dark:border-lime-500/20">
              <p className="text-[9px] uppercase text-lime-700 font-black">Hierbas</p>
              <p className="text-lg">{resources.herbs}</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
              <p className="text-[9px] uppercase text-indigo-700 font-black">Sopas</p>
              <p className="text-lg">{resources.soups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ListChecks size={16} className="text-emerald-500" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Objetivos</p>
          </div>
          <div className="space-y-2">
            {objectiveCompletion.map((obj) => (
              <div key={obj.label} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{obj.label}</span>
                  <span className={obj.done ? 'text-emerald-500' : 'text-slate-400'}>
                    {Math.min(obj.value, obj.target)}/{obj.target}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{ width: `${obj.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Día {day}</span>
            <span>{completionRate >= 100 ? 'Objetivos completos' : `${Math.round(completionRate)}% listo`}</span>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-indigo-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Asignaciones</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sobrevivientes disponibles: {available}</p>
        <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
          {(
            [
              { key: 'woodcutters', label: 'Leñadores', icon: <Axe size={14} /> },
              { key: 'hunters', label: 'Cazadores', icon: <Mountain size={14} /> },
              { key: 'cooks', label: 'Cocineros', icon: <Soup size={14} /> },
              { key: 'scouts', label: 'Exploradores', icon: <Compass size={14} /> },
              { key: 'medics', label: 'Médicos', icon: <HeartPulse size={14} /> }
            ] as const
          ).map((role) => (
            <div key={role.key} className="flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">{role.icon}</span>
                <span className="font-black uppercase tracking-widest">{role.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAssignmentChange(role.key, -1)}
                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-black active:scale-95"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold">{assignments[role.key]}</span>
                <button
                  onClick={() => handleAssignmentChange(role.key, 1)}
                  className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={runTurn}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-[0.98]"
          >
            Resolver Día
          </button>
          <button
            onClick={resetLevel}
            className="px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest"
          >
            Reiniciar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Soup size={16} className="text-orange-500" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Cola del caldero</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visualiza cómo se forman las filas: cazadores entregan carne, cocineros preparan sopa y el resto espera turno.
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: currentLevel.survivors }).map((_, idx) => {
              const role =
                idx < assignments.hunters
                  ? 'hunter'
                  : idx < assignments.hunters + assignments.woodcutters
                  ? 'wood'
                  : idx < assignments.hunters + assignments.woodcutters + assignments.cooks
                  ? 'cook'
                  : idx < assignments.hunters + assignments.woodcutters + assignments.cooks + assignments.scouts
                  ? 'scout'
                  : 'medic';
              const badge =
                role === 'hunter'
                  ? 'bg-amber-100 text-amber-700'
                  : role === 'wood'
                  ? 'bg-emerald-100 text-emerald-700'
                  : role === 'cook'
                  ? 'bg-orange-100 text-orange-700'
                  : role === 'scout'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-pink-100 text-pink-700';
              const icon =
                role === 'hunter'
                  ? '🏹'
                  : role === 'wood'
                  ? '🪓'
                  : role === 'cook'
                  ? '🍲'
                  : role === 'scout'
                  ? '🧭'
                  : '⛑️';
              return (
                <div
                  key={idx}
                  className={`w-10 h-12 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center text-lg ${badge}`}
                >
                  <span>{icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Fish size={16} className="text-sky-500" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Mapa</p>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {currentLevel.map.map((row, rIdx) =>
              row.split('').map((cell, cIdx) => {
                const tile = tilePalette[cell];
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`aspect-square rounded-xl text-center text-lg flex items-center justify-center border border-white/60 dark:border-white/5 ${tile.color}`}
                    title={tile.label}
                  >
                    {tile.icon}
                  </div>
                );
              })
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
            {Object.entries(tilePalette)
              .filter(([key]) => key !== '.')
              .map(([key, tile]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="text-base">{tile.icon}</span>
                  <span>{tile.label}</span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <HeartPulse size={16} className="text-rose-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Bitácora</p>
        </div>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {log.map((entry, idx) => (
            <li key={idx} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              {entry}
            </li>
          ))}
        </ul>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Consejos: {currentLevel.tips.join(' • ')}
        </div>
      </section>
    </div>
  );
};

export default WhiteoutSurvival;
