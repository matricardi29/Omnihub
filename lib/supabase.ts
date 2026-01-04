
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError = !supabaseUrl || !supabaseAnonKey
  ? 'Faltan variables de entorno de Supabase. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  : null;

let supabase: SupabaseClient | null = null;

if (!supabaseConfigError) {
  supabase = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
  console.error(supabaseConfigError);
}

export { supabase };

// Helper for Real-time subscriptions
export const subscribeToGame = (gameId: string, onUpdate: (payload: any) => void) => {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Revisa tus variables de entorno.');
  }

  return supabase
    .channel(`game-${gameId}`)
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, 
        onUpdate)
    .subscribe();
};
