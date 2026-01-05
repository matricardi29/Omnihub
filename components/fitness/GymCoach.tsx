import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarClock, CheckCircle2, ClipboardList, Dumbbell, Flame, HeartHandshake, ListChecks, Timer } from 'lucide-react';

interface Preferences {
  goal: 'hypertrophy' | 'strength' | 'fatloss' | 'maintenance';
  daysPerWeek: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: 'gym' | 'dumbbells' | 'bodyweight';
  focuses: string[];
  sessionLength: number;
  notes: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  tip?: string;
  emphasis: 'push' | 'pull' | 'legs' | 'core' | 'cardio';
}

interface PlanDay {
  id: string;
  title: string;
  focus: string;
  target: string;
  exercises: Exercise[];
}

interface LogEntry {
  weight: string;
  reps: string;
  feeling: 'fácil' | 'controlado' | 'duro';
  notes?: string;
  done: boolean;
  timestamp: string;
}

type ExerciseLogs = Record<string, LogEntry[]>;

const defaultPreferences: Preferences = {
  goal: 'hypertrophy',
  daysPerWeek: 4,
  experience: 'intermediate',
  equipment: 'gym',
  focuses: ['pecho', 'espalda', 'pierna', 'full body'],
  sessionLength: 60,
  notes: ''
};

const feelingPalette: Record<LogEntry['feeling'], string> = {
  'fácil': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
  'controlado': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200',
  'duro': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
};

const GymCoach: React.FC<{ user?: any }> = ({ user }) => {
  const storageKey = useMemo(() => `omnihub-gym-plan-${user?.email ?? 'anon'}`, [user?.email]);
  const logsKey = useMemo(() => `omnihub-gym-logs-${user?.email ?? 'anon'}`, [user?.email]);

  const [preferences, setPreferences] = useState<Preferences>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
    return defaultPreferences;
  });

  const [plan, setPlan] = useState<PlanDay[]>(() => {
    const stored = localStorage.getItem(`${storageKey}-plan`);
    return stored ? JSON.parse(stored) : [];
  });

  const [logs, setLogs] = useState<ExerciseLogs>(() => {
    const stored = localStorage.getItem(logsKey);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}-plan`, JSON.stringify(plan));
  }, [plan, storageKey]);

  useEffect(() => {
    localStorage.setItem(logsKey, JSON.stringify(logs));
  }, [logs, logsKey]);

  const resolveVolume = (goal: Preferences['goal'], experience: Preferences['experience']) => {
    const baseSets = goal === 'strength' ? 4 : goal === 'fatloss' ? 3 : 3;
    const bonus = experience === 'advanced' ? 1 : experience === 'beginner' ? -1 : 0;
    return Math.max(2, baseSets + bonus);
  };

  const buildExercises = (focus: string, prefs: Preferences): Exercise[] => {
    const setCount = resolveVolume(prefs.goal, prefs.experience);
    const repScheme = {
      hypertrophy: '8-12',
      strength: '4-6',
      fatloss: '12-15',
      maintenance: '8-10'
    }[prefs.goal];

    const rest = prefs.goal === 'strength' ? '2-3 min' : prefs.goal === 'fatloss' ? '45-60 seg' : '60-90 seg';

    const pools: Record<string, Exercise[]> = {
      pecho: [
        { name: 'Press banca', sets: setCount, reps: repScheme, rest, emphasis: 'push', tip: 'Cierra escápulas y mantén los pies firmes' },
        { name: 'Press inclinado mancuernas', sets: setCount - 1, reps: repScheme, rest, emphasis: 'push', tip: 'No rebotes en la parte baja' },
        { name: 'Aperturas', sets: setCount - 1, reps: '12-15', rest, emphasis: 'push', tip: 'Siente el estiramiento, controla la excéntrica' },
        { name: 'Fondos o flexiones lastradas', sets: setCount - 1, reps: repScheme, rest, emphasis: 'push', tip: 'Mantén el core activo' },
      ],
      espalda: [
        { name: 'Dominadas / Jalón', sets: setCount, reps: repScheme, rest, emphasis: 'pull', tip: 'Piensa en llevar codos al suelo' },
        { name: 'Remo con barra', sets: setCount - 1, reps: repScheme, rest, emphasis: 'pull', tip: 'Espalda neutra, controla el impulso' },
        { name: 'Remo mancuerna', sets: setCount - 1, reps: '10-12', rest, emphasis: 'pull', tip: 'Pausa arriba para sentir la escápula' },
        { name: 'Facepulls', sets: setCount - 1, reps: '15', rest, emphasis: 'pull', tip: 'Codos altos, tira hacia la frente' },
      ],
      pierna: [
        { name: 'Sentadilla', sets: setCount, reps: repScheme, rest, emphasis: 'legs', tip: 'Respira profundo, baja controlado' },
        { name: 'Peso muerto rumano', sets: setCount - 1, reps: repScheme, rest, emphasis: 'legs', tip: 'Caderas atrás, glúteo manda' },
        { name: 'Zancadas caminando', sets: setCount - 1, reps: '10-12 c/u', rest, emphasis: 'legs', tip: 'Rodilla estable, pecho alto' },
        { name: 'Elevaciones de talón', sets: setCount - 1, reps: '15', rest, emphasis: 'legs', tip: 'Pausa arriba para gemelo' },
      ],
      hombro: [
        { name: 'Press militar', sets: setCount, reps: repScheme, rest, emphasis: 'push', tip: 'Cadera bloqueada, no arquees' },
        { name: 'Elevaciones laterales', sets: setCount, reps: '12-15', rest, emphasis: 'push', tip: 'Pulgares hacia abajo al subir' },
        { name: 'Pájaros', sets: setCount - 1, reps: '15', rest, emphasis: 'pull', tip: 'Hombros alejados de las orejas' },
        { name: 'Facepulls', sets: setCount - 1, reps: '15', rest, emphasis: 'pull', tip: 'Controla la vuelta' },
      ],
      core: [
        { name: 'Plancha con toque de hombro', sets: setCount - 1, reps: '30-45 seg', rest, emphasis: 'core', tip: 'Caderas estables' },
        { name: 'Crunch en cable o peso', sets: setCount - 1, reps: '15', rest, emphasis: 'core', tip: 'Redondea columna, exhala fuerte' },
        { name: 'Pallof press', sets: setCount - 1, reps: '10-12 c/u', rest, emphasis: 'core', tip: 'Evita rotar el torso' },
        { name: 'Elevaciones de piernas', sets: setCount - 1, reps: '10-12', rest, emphasis: 'core', tip: 'No balancees, controla' },
      ],
      'full body': [
        { name: 'Sentadilla goblet', sets: setCount, reps: repScheme, rest, emphasis: 'legs', tip: 'Pecho alto, rodillas siguen pies' },
        { name: 'Press mancuernas', sets: setCount - 1, reps: repScheme, rest, emphasis: 'push', tip: 'Controla la bajada 3 seg' },
        { name: 'Remo con mancuernas', sets: setCount - 1, reps: repScheme, rest, emphasis: 'pull', tip: 'Aprieta escápulas arriba' },
        { name: 'Plancha + mountain climbers', sets: setCount - 1, reps: '40-60 seg', rest, emphasis: 'core', tip: 'No hundas la lumbar' },
      ],
    };

    const equipmentSwaps: Record<Preferences['equipment'], Partial<typeof pools>> = {
      bodyweight: {
        pecho: [
          { name: 'Flexiones con tempo 3-1-1', sets: setCount, reps: repScheme, rest, emphasis: 'push', tip: 'Mantén codos a 45°' },
          { name: 'Flexiones declinadas', sets: setCount - 1, reps: repScheme, rest, emphasis: 'push', tip: 'Activa glúteo para estabilidad' },
          { name: 'Flexiones diamante', sets: setCount - 1, reps: '10-12', rest, emphasis: 'push', tip: 'Rango corto controlado' },
          { name: 'Fondos en banco', sets: setCount - 1, reps: '12-15', rest, emphasis: 'push', tip: 'Hombros lejos de orejas' },
        ],
        espalda: [
          { name: 'Dominadas asistidas/bandas', sets: setCount, reps: repScheme, rest, emphasis: 'pull', tip: 'Piensa en el dorsal' },
          { name: 'Remo invertido', sets: setCount - 1, reps: repScheme, rest, emphasis: 'pull', tip: 'Caderas alineadas' },
          { name: 'Superman hold', sets: setCount - 1, reps: '30 seg', rest, emphasis: 'pull', tip: 'Aprieta glúteo y espalda alta' },
          { name: 'Facepull con banda', sets: setCount - 1, reps: '15', rest, emphasis: 'pull', tip: 'Controla la excéntrica' },
        ],
        pierna: [
          { name: 'Sentadilla búlgara', sets: setCount, reps: repScheme, rest, emphasis: 'legs', tip: 'Rodilla estable, torso alto' },
          { name: 'Peso muerto a una pierna', sets: setCount - 1, reps: repScheme, rest, emphasis: 'legs', tip: 'Lleva la cadera atrás' },
          { name: 'Hip thrust a una pierna', sets: setCount - 1, reps: '12-15', rest, emphasis: 'legs', tip: 'Pausa arriba 2 seg' },
          { name: 'Sprints / skipping', sets: setCount - 1, reps: '20-40 seg', rest, emphasis: 'cardio', tip: 'Explosivo, pero controlado' },
        ],
        hombro: pools.hombro,
        core: pools.core,
        'full body': [
          { name: 'Burpees controlados', sets: setCount, reps: '10-15', rest, emphasis: 'cardio', tip: 'No pierdas la técnica' },
          { name: 'Sentadilla con salto suave', sets: setCount - 1, reps: '12-15', rest, emphasis: 'legs', tip: 'Aterriza silencioso' },
          { name: 'Flexiones', sets: setCount - 1, reps: repScheme, rest, emphasis: 'push', tip: 'Core apretado, no colapses' },
          { name: 'Planchas dinámicas', sets: setCount - 1, reps: '40-60 seg', rest, emphasis: 'core', tip: 'Evita girar caderas' },
        ],
      },
      dumbbells: {
        pecho: [
          { name: 'Press mancuernas plano', sets: setCount, reps: repScheme, rest, emphasis: 'push', tip: 'Recorre completo controlado' },
          { name: 'Press inclinado', sets: setCount - 1, reps: repScheme, rest, emphasis: 'push', tip: 'Cierra escápulas' },
          { name: 'Aperturas', sets: setCount - 1, reps: '12-15', rest, emphasis: 'push', tip: 'Alarga 2 seg la bajada' },
          { name: 'Fondos en banco', sets: setCount - 1, reps: '12-15', rest, emphasis: 'push', tip: 'Hombros atrás' },
        ],
        espalda: [
          { name: 'Remo mancuerna', sets: setCount, reps: repScheme, rest, emphasis: 'pull', tip: 'Pausa arriba 1 seg' },
          { name: 'Remo inclinado 2 mancuernas', sets: setCount - 1, reps: repScheme, rest, emphasis: 'pull', tip: 'No encorves' },
          { name: 'Pullover mancuerna', sets: setCount - 1, reps: '12-15', rest, emphasis: 'pull', tip: 'Respira profundo' },
          { name: 'Facepull con banda', sets: setCount - 1, reps: '15', rest, emphasis: 'pull', tip: 'Control' },
        ],
        pierna: [
          { name: 'Zancada con mancuernas', sets: setCount, reps: repScheme, rest, emphasis: 'legs', tip: 'Rodilla encima del pie' },
          { name: 'Peso muerto rumano', sets: setCount - 1, reps: repScheme, rest, emphasis: 'legs', tip: 'Cadera atrás, espalda neutra' },
          { name: 'Sentadilla goblet', sets: setCount - 1, reps: repScheme, rest, emphasis: 'legs', tip: 'Empuja el suelo' },
          { name: 'Elevación de talón', sets: setCount - 1, reps: '15', rest, emphasis: 'legs', tip: 'Pausa arriba' },
        ],
        hombro: pools.hombro,
        core: pools.core,
        'full body': pools['full body'],
      },
      gym: pools
    };

    const selectedPool = equipmentSwaps[prefs.equipment][focus as keyof typeof pools] || pools[focus as keyof typeof pools] || pools['full body'];
    return selectedPool.map((exercise) => ({ ...exercise, sets: Math.max(2, exercise.sets) })).slice(0, 5);
  };

  const buildPlan = (prefs: Preferences) => {
    const focusOrder = prefs.focuses.length ? prefs.focuses : defaultPreferences.focuses;
    const days: PlanDay[] = Array.from({ length: prefs.daysPerWeek }, (_, i) => {
      const focus = focusOrder[i % focusOrder.length];
      return {
        id: `day-${i + 1}`,
        title: `Día ${i + 1}`,
        focus,
        target: `${prefs.goal === 'strength' ? 'Fuerza' : prefs.goal === 'fatloss' ? 'Déficit con gasto' : prefs.goal === 'maintenance' ? 'Mantenimiento activo' : 'Hipertrofia guiada'} · ${prefs.sessionLength} min`,
        exercises: buildExercises(focus, prefs)
      };
    });
    return days;
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan = buildPlan(preferences);
    setPlan(newPlan);
  };

  const handleLog = (dayId: string, exercise: Exercise, entry: Omit<LogEntry, 'timestamp'>) => {
    const key = `${dayId}-${exercise.name}`;
    setLogs((prev) => {
      const history = prev[key] ?? [];
      const updated = [...history, { ...entry, timestamp: new Date().toISOString() }];
      return { ...prev, [key]: updated };
    });
  };

  const lastEntries = useMemo(() => Object.values(logs).flat().slice(-5).reverse(), [logs]);

  const completionRate = useMemo(() => {
    const all = Object.values(logs).flat();
    if (!all.length) return 0;
    const done = all.filter((entry) => entry.done).length;
    return Math.round((done / all.length) * 100);
  }, [logs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
          <Dumbbell size={22} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Omni-Gym</p>
          <h1 className="text-xl font-black tracking-tight">Rutinas a medida & seguimiento</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Define tu objetivo y registra repes, peso y sensaciones en cada sesión.</p>
        </div>
      </header>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm">
        <form className="grid grid-cols-2 gap-3 text-[11px]" onSubmit={handleGenerate}>
          <div className="col-span-2 flex items-center gap-2 px-3 py-2 bg-slate-100/70 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            <Activity size={14} className="text-indigo-500" />
            <p className="text-slate-500 dark:text-slate-400">Cuéntame tu objetivo y armamos un esquema por días.</p>
          </div>

          <label className="space-y-1">
            <span className="font-bold">Objetivo</span>
            <select
              value={preferences.goal}
              onChange={(e) => setPreferences((p) => ({ ...p, goal: e.target.value as Preferences['goal'] }))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2"
            >
              <option value="hypertrophy">Hipertrofia</option>
              <option value="strength">Fuerza</option>
              <option value="fatloss">Pérdida de grasa</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="font-bold">Días/semana</span>
            <input
              type="number"
              min={2}
              max={6}
              value={preferences.daysPerWeek}
              onChange={(e) => setPreferences((p) => ({ ...p, daysPerWeek: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="font-bold">Experiencia</span>
            <select
              value={preferences.experience}
              onChange={(e) => setPreferences((p) => ({ ...p, experience: e.target.value as Preferences['experience'] }))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="font-bold">Equipo</span>
            <select
              value={preferences.equipment}
              onChange={(e) => setPreferences((p) => ({ ...p, equipment: e.target.value as Preferences['equipment'] }))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2"
            >
              <option value="gym">Gimnasio completo</option>
              <option value="dumbbells">Sólo mancuernas/bandas</option>
              <option value="bodyweight">Peso corporal</option>
            </select>
          </label>

          <label className="space-y-1 col-span-2">
            <span className="font-bold">Zonas a priorizar</span>
            <div className="flex flex-wrap gap-2">
              {['pecho', 'espalda', 'pierna', 'hombro', 'core', 'full body'].map((area) => {
                const active = preferences.focuses.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() =>
                      setPreferences((p) => ({
                        ...p,
                        focuses: active ? p.focuses.filter((f) => f !== area) : [...p.focuses, area]
                      }))
                    }
                    className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wide transition-all ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/30 shadow'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </label>

          <label className="space-y-1">
            <span className="font-bold">Duración (min)</span>
            <input
              type="number"
              min={30}
              max={90}
              value={preferences.sessionLength}
              onChange={(e) => setPreferences((p) => ({ ...p, sessionLength: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2"
            />
          </label>

          <label className="space-y-1 col-span-2">
            <span className="font-bold">Detalles/lesiones</span>
            <textarea
              value={preferences.notes}
              onChange={(e) => setPreferences((p) => ({ ...p, notes: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 min-h-[60px]"
              placeholder="Ej: rodilla izquierda sensible, evitar impacto; preferencia por trineo."
            />
          </label>

          <button
            type="submit"
            className="col-span-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-black rounded-2xl py-3 uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-indigo-600/30 active:scale-[0.98]"
          >
            Crear rutina visual
          </button>
        </form>
      </section>

      {plan.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center gap-3">
              <CalendarClock className="text-indigo-500" size={18} />
              <div>
                <p className="text-slate-400 uppercase font-bold text-[9px]">Plan</p>
                <p className="font-black">{plan.length} días</p>
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={18} />
              <div>
                <p className="text-slate-400 uppercase font-bold text-[9px]">Cumplimiento</p>
                <p className="font-black">{completionRate}%</p>
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center gap-3">
              <Flame className="text-amber-500" size={18} />
              <div>
                <p className="text-slate-400 uppercase font-bold text-[9px]">Últimos</p>
                <p className="font-black">{lastEntries.length} registros</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {plan.map((day) => (
              <div key={day.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">{day.title}</p>
                    <h3 className="text-lg font-black">{day.focus}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{day.target}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
                    {preferences.equipment}
                  </span>
                </div>

                <div className="space-y-3">
                  {day.exercises.map((exercise, idx) => {
                    const logKey = `${day.id}-${exercise.name}`;
                    const history = logs[logKey] ?? [];
                    const latest = history[history.length - 1];

                    return (
                      <div key={exercise.name} className="rounded-2xl border border-slate-200 dark:border-white/5 p-4 bg-slate-50/60 dark:bg-slate-900/50">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[11px] font-black">{idx + 1}</div>
                              <h4 className="font-black text-sm leading-tight">{exercise.name}</h4>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">{exercise.sets}x{exercise.reps} · Descanso {exercise.rest}</p>
                            {exercise.tip && <p className="text-[10px] text-slate-400 italic">Tip: {exercise.tip}</p>}
                          </div>
                          <ListChecks className="text-slate-300" size={16} />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-2 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
                            <Timer size={14} className="text-slate-400" />
                            <span className="font-bold">Tempo controlado</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
                            <HeartHandshake size={14} className="text-emerald-400" />
                            <span className="font-bold capitalize">{preferences.goal}</span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
                            <span>Registro rápido</span>
                            {latest && (
                              <span className={`px-2 py-1 rounded-full text-[10px] ${feelingPalette[latest.feeling]}`}>
                                Última: {latest.reps} reps · {latest.weight} kg
                              </span>
                            )}
                          </div>

                          <ExerciseLogger
                            onSave={(payload) => handleLog(day.id, exercise, payload)}
                          />

                          {history.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase font-black text-slate-400">Seguimiento</p>
                              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                {history
                                  .slice()
                                  .reverse()
                                  .map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between gap-3 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
                                      <div>
                                        <p className="font-bold">{entry.reps} reps · {entry.weight} kg</p>
                                        <p className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleDateString()} · {entry.notes || 'Sin notas'}</p>
                                      </div>
                                      <span className={`px-2 py-1 rounded-full text-[10px] ${feelingPalette[entry.feeling]}`}>{entry.feeling}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {lastEntries.length > 0 && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black">Timeline de sesiones</h3>
                <ClipboardList size={16} className="text-slate-400" />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {lastEntries.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
                    <div>
                      <p className="font-bold">{entry.reps} reps · {entry.weight} kg</p>
                      <p className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleString()}</p>
                      {entry.notes && <p className="text-[10px] text-slate-400">{entry.notes}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] ${feelingPalette[entry.feeling]}`}>{entry.feeling}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm text-center space-y-3">
          <p className="text-sm font-black">Genera tu rutina personalizada</p>
          <p className="text-[11px] text-slate-500">Añade tu objetivo, equipo y zonas a priorizar para ver ejercicios con sets, repes y espacio para registrar peso y sensaciones.</p>
        </div>
      )}
    </div>
  );
};

interface LoggerProps {
  onSave: (entry: Omit<LogEntry, 'timestamp'>) => void;
}

const ExerciseLogger: React.FC<LoggerProps> = ({ onSave }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [feeling, setFeeling] = useState<LogEntry['feeling']>('controlado');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !reps) return;
    onSave({ weight, reps, feeling, notes, done });
    setNotes('');
  };

  return (
    <form className="grid grid-cols-2 gap-2" onSubmit={handleSubmit}>
      <input
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        placeholder="Repeticiones"
        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-[11px]"
      />
      <input
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="Peso (kg)"
        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-[11px]"
      />
      <select
        value={feeling}
        onChange={(e) => setFeeling(e.target.value as LogEntry['feeling'])}
        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-[11px]"
      >
        <option value="fácil">Fácil</option>
        <option value="controlado">Controlado</option>
        <option value="duro">Duro</option>
      </select>
      <label className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
        <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />
        Marcar completado
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas (dolor, energía, técnica...)"
        className="col-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-[11px]"
      />
      <button
        type="submit"
        className="col-span-2 bg-indigo-600 text-white rounded-xl py-2 font-black text-[11px] uppercase tracking-[0.2em] active:scale-[0.98]"
      >
        Guardar registro
      </button>
    </form>
  );
};

export default GymCoach;
