export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  id: string;
  player: 1 | 2;
  position: Position;
  isInLatrine: boolean;
}

export interface GameState {
  pieces: Piece[];
  currentPlayer: 1 | 2;
  selectedPiece: Piece | null;
  validMoves: Position[];
  reserves: { player1: number; player2: number };
  gameStatus: 'playing' | 'player1Wins' | 'player2Wins';
  moveHistory: MoveRecord[];
}

export interface MoveRecord {
  from: Position;
  to: Position;
  capturedPieces: Piece[];
  timestamp: number;
}
