import React, { useState, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Piece, Position, GameState } from '../types';
import './GameBoard.css';

const CELL_SIZE = 60;
const BOARD_SIZE = 8;

export const GameBoard: React.FC = () => {
  const [engine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState>(engine.getState());

  const handleCellClick = useCallback((x: number, y: number) => {
    const state = engine.getState();
    const piece = state.pieces.find(p => !p.isInLatrine && p.position.x === x && p.position.y === y);

    if (piece && piece.player === state.currentPlayer && state.gameStatus === 'playing') {
      engine.selectPiece(piece);
      setGameState({ ...engine.getState() });
    } else if (state.selectedPiece && state.gameStatus === 'playing') {
      const moved = engine.movePiece(state.selectedPiece, { x, y });
      setGameState({ ...engine.getState() });
    }
  }, [engine]);

  const handleReset = useCallback(() => {
    engine.resetGame();
    setGameState({ ...engine.getState() });
  }, [engine]);

  const state = engine.getState();
  const player1Pieces = state.pieces.filter(p => p.player === 1 && !p.isInLatrine).length;
  const player2Pieces = state.pieces.filter(p => p.player === 2 && !p.isInLatrine).length;

  return (
    <div className="game-container">
      <div className="header">
        <h1>⚔️ Ancient Board Game</h1>
        <p className="subtitle">Sandwiching & Carrying</p>
      </div>

      <div className="status-bar">
        <div className="player-status player1">
          <span className="player-badge">Player 1</span>
          <span className="piece-count">🔴 {player1Pieces} pieces</span>
        </div>
        <div className="turn-indicator">
          <span className="current-player">
            {state.gameStatus === 'playing' 
              ? `Current: Player ${state.currentPlayer}` 
              : state.gameStatus === 'player1Wins' 
              ? '🎉 Player 1 Wins!' 
              : '🎉 Player 2 Wins!'}
          </span>
        </div>
        <div className="player-status player2">
          <span className="player-badge">Player 2</span>
          <span className="piece-count">🔵 {player2Pieces} pieces</span>
        </div>
      </div>

      <div className="board-wrapper">
        <div 
          className="game-board"
          style={{
            width: CELL_SIZE * BOARD_SIZE,
            height: CELL_SIZE * BOARD_SIZE,
          }}
        >
          {Array.from({ length: BOARD_SIZE }).map((_, y) => (
            <div key={y} className="board-row">
              {Array.from({ length: BOARD_SIZE }).map((_, x) => {
                const piece = state.pieces.find(
                  p => !p.isInLatrine && p.position.x === x && p.position.y === y
                );
                const isValidMove = state.validMoves.some(m => m.x === x && m.y === y);
                const isSelected =
                  state.selectedPiece?.position.x === x && state.selectedPiece?.position.y === y;
                const isLatrine = x === 3 && y === 3;

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`board-cell ${isLatrine ? 'latrine' : ''} ${
                      isValidMove ? 'valid-move' : ''
                    } ${(x + y) % 2 === 0 ? 'light' : 'dark'}`}
                    onClick={() => handleCellClick(x, y)}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                    }}
                  >
                    {piece && (
                      <div
                        className={`piece player${piece.player} ${
                          isSelected ? 'selected' : ''
                        }`}
                      >
                        <span className="piece-label">P{piece.player}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="controls">
        <button className="reset-btn" onClick={handleReset}>
          🔄 New Game
        </button>
      </div>

      {state.moveHistory.length > 0 && (
        <div className="move-history">
          <h3>Move History</h3>
          <div className="history-list">
            {state.moveHistory.map((move, idx) => (
              <div key={idx} className="history-item">
                Move {idx + 1}: ({move.from.x},{move.from.y}) → ({move.to.x},{move.to.y})
                {move.capturedPieces.length > 0 && (
                  <span className="capture-badge">Captured: {move.capturedPieces.length}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
