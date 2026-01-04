
export type GameType = 'scrabble' | 'generala' | 'catan';

export interface GameState {
  id: string;
  type: GameType;
  status: 'waiting' | 'playing' | 'finished';
  players: string[]; // List of nicknames
  current_turn: number; // Index of players array
  board_data: any; // Dynamic JSON for different game logic
  last_move_timestamp: number;
}

export interface Investment {
  id: string;
  amount: number;
  date: string;
  label: string;
}

export interface CompoundInterestConfig {
  principal: number;
  rate: number;
  years: number;
  frequency: number;
  monthlyContribution: number;
}
