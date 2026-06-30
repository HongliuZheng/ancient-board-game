import { GameState, Piece, Position, MoveRecord } from '../types';

const BOARD_SIZE = 8;
const LATRINE_POS = { x: 3, y: 3 }; // Center of 8x8 board

export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = this.initializeGame();
  }

  private initializeGame(): GameState {
    const pieces: Piece[] = [];

    // Initialize player 1 pieces (bottom row, y=7)
    for (let i = 0; i < 5; i++) {
      pieces.push({
        id: `p1-${i}`,
        player: 1,
        position: { x: i, y: 7 },
        isInLatrine: false,
      });
    }

    // Initialize player 2 pieces (top row, y=0)
    for (let i = 0; i < 5; i++) {
      pieces.push({
        id: `p2-${i}`,
        player: 2,
        position: { x: i, y: 0 },
        isInLatrine: false,
      });
    }

    return {
      pieces,
      currentPlayer: 1,
      selectedPiece: null,
      validMoves: [],
      reserves: { player1: 0, player2: 0 },
      gameStatus: 'playing',
      moveHistory: [],
    };
  }

  selectPiece(piece: Piece): void {
    if (piece.player !== this.state.currentPlayer || this.state.gameStatus !== 'playing') {
      return;
    }

    this.state.selectedPiece = piece;
    this.state.validMoves = this.calculateValidMoves(piece);
  }

  private calculateValidMoves(piece: Piece): Position[] {
    const moves: Position[] = [];

    // Horizontal/Vertical moves (1 space only)
    const orthogonalDirs = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];

    for (const dir of orthogonalDirs) {
      const newPos = { x: piece.position.x + dir.x, y: piece.position.y + dir.y };
      if (this.isValidPosition(newPos) && !this.isOccupied(newPos)) {
        moves.push(newPos);
      }
    }

    // Diagonal moves (unlimited distance)
    const diagonalDirs = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    for (const dir of diagonalDirs) {
      let current = { x: piece.position.x + dir.x, y: piece.position.y + dir.y };
      while (this.isValidPosition(current)) {
        if (this.isOccupied(current)) {
          break; // Stop at the first occupied piece
        }
        moves.push({ ...current });
        current = { x: current.x + dir.x, y: current.y + dir.y };
      }
    }

    return moves;
  }

  private isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
  }

  private isOccupied(pos: Position): boolean {
    return this.state.pieces.some(p => !p.isInLatrine && p.position.x === pos.x && p.position.y === pos.y);
  }

  private getPieceAt(pos: Position): Piece | undefined {
    return this.state.pieces.find(p => !p.isInLatrine && p.position.x === pos.x && p.position.y === pos.y);
  }

  movePiece(from: Piece, to: Position): boolean {
    if (!this.state.validMoves.some(m => m.x === to.x && m.y === to.y)) {
      return false; // Invalid move
    }

    // Save move record
    const capturedPieces: Piece[] = [];

    // Perform the move
    from.position = { ...to };

    // Check for captures
    const sandwichCaptured = this.checkSandwichCapture(from);
    const carryCaptured = this.checkCarryCapture(from);

    capturedPieces.push(...sandwichCaptured, ...carryCaptured);

    this.state.moveHistory.push({
      from: { ...from.position },
      to: { ...to },
      capturedPieces,
      timestamp: Date.now(),
    });

    // Update game status
    this.updateGameStatus();

    // End turn
    this.endTurn();

    return true;
  }

  private checkSandwichCapture(movingPiece: Piece): Piece[] {
    const captured: Piece[] = [];

    // Check all four directions for potential sandwiches
    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    for (const dir of directions) {
      const targetPos = { x: movingPiece.position.x + dir.x, y: movingPiece.position.y + dir.y };
      const target = this.getPieceAt(targetPos);

      // Check if there's an opponent piece adjacent
      if (target && target.player !== movingPiece.player) {
        // Check if the space beyond is empty (no blocking pieces)
        const beyondPos = { x: targetPos.x + dir.x, y: targetPos.y + dir.y };
        
        // Check for blocking pieces in between on the same line
        if (!this.hasBlockingPieces(movingPiece.position, targetPos, beyondPos)) {
          // If beyond is also empty and valid, this is a sandwich
          if (this.isValidPosition(beyondPos) && !this.isOccupied(beyondPos)) {
            target.isInLatrine = true;
            captured.push(target);
          }
        }
      }
    }

    return captured;
  }

  private checkCarryCapture(movingPiece: Piece): Piece[] {
    const captured: Piece[] = [];

    // Check all directions for two opponent pieces with the moving piece between them
    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    for (const dir of directions) {
      const pos1 = { x: movingPiece.position.x + dir.x, y: movingPiece.position.y + dir.y };
      const pos2 = { x: movingPiece.position.x - dir.x, y: movingPiece.position.y - dir.y };

      const piece1 = this.getPieceAt(pos1);
      const piece2 = this.getPieceAt(pos2);

      // Both positions must be valid and occupied by same player pieces
      if (
        this.isValidPosition(pos1) &&
        this.isValidPosition(pos2) &&
        piece1 &&
        piece2 &&
        piece1.player === piece2.player &&
        piece1.player !== movingPiece.player &&
        !this.hasBlockingPieces(pos1, movingPiece.position, pos2)
      ) {
        piece1.isInLatrine = true;
        piece2.isInLatrine = true;
        captured.push(piece1, piece2);
      }
    }

    return captured;
  }

  private hasBlockingPieces(pos1: Position, pos2: Position, pos3: Position): boolean {
    // Check if there are any pieces between pos1 and pos2, or between pos2 and pos3
    // This is a simplified check; you may need to expand based on actual rules
    return false; // TODO: Implement blocking piece detection
  }

  private updateGameStatus(): void {
    const player1Pieces = this.state.pieces.filter(p => p.player === 1 && !p.isInLatrine);
    const player2Pieces = this.state.pieces.filter(p => p.player === 2 && !p.isInLatrine);

    // Check win conditions
    if (player2Pieces.length === 0) {
      this.state.gameStatus = 'player1Wins';
    } else if (player1Pieces.length === 0) {
      this.state.gameStatus = 'player2Wins';
    }
  }

  private endTurn(): void {
    this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    this.state.selectedPiece = null;
    this.state.validMoves = [];
  }

  getState(): GameState {
    return this.state;
  }

  resetGame(): void {
    this.state = this.initializeGame();
  }
}
