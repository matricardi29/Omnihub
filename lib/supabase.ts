
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwdsvylnmcvkglhprekp.supabase.co';
const supabaseAnonKey = 'sb_publishable_ed6BKpgSMqbG3mxcKzGlVA_2iY2HT4l';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for Real-time subscriptions
export const subscribeToGame = (gameId: string, onUpdate: (payload: any) => void) => {
  return supabase
    .channel(`game-${gameId}`)
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, 
        onUpdate)
    .subscribe();
};
