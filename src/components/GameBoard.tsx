import React, { useState, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Piece, Position, GameState } from '../types';
import './GameBoard.css';

const CELL_SIZE = 60;
const BOARD_SIZE = 8;
const DIAMOND_SIZE = 4; // 4x4 diamond cells

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

  // Helper function to check if a diamond cell is the center latrine
  const isDiamondLatrine = (row: number, col: number) => row === 1 && col === 1;

  // Helper to render diamond cells
  const renderDiamondCell = (row: number, col: number) => {
    const isLatrine = isDiamondLatrine(row, col);
    const isValidMove = state.validMoves.some(
      m => m.x === col + BOARD_SIZE + 1 && m.y === row + (BOARD_SIZE - DIAMOND_SIZE) / 2
    );
    const isSelected = false; // Diamond cells are display-only for now
    const boardIndex = col + (BOARD_SIZE - DIAMOND_SIZE) / 2;

    return (
      <div
        key={`diamond-${row}-${col}`}
        className={`diamond-cell ${isLatrine ? 'latrine' : ''} ${
          isValidMove ? 'valid-move' : ''
        } ${(row + col) % 2 === 0 ? 'light' : 'dark'}`}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
        }}
      >
        {isLatrine && (
          <div className="latrine-center">
            <span className="latrine-icon">🔒</span>
          </div>
        )}
      </div>
    );
  };

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
        <svg className="board-canvas" width={CELL_SIZE * 10} height={CELL_SIZE * 8}>
          {/* Connection line from board to diamond */}
          <line
            x1={CELL_SIZE * 8}
            y1={CELL_SIZE * 4}
            x2={CELL_SIZE * 8.5}
            y2={CELL_SIZE * 4}
            stroke="#333"
            strokeWidth="3"
          />
          
          {/* Diamond outline */}
          <polygon
            points={`${CELL_SIZE * 8.5},${CELL_SIZE * 2} ${CELL_SIZE * 10},${CELL_SIZE * 4} ${CELL_SIZE * 8.5},${CELL_SIZE * 6} ${CELL_SIZE * 7},${CELL_SIZE * 4}`}
            fill="none"
            stroke="#333"
            strokeWidth="3"
          />
          
          {/* Diamond cross - extended to corners */}
          {/* Vertical line */}
          <line
            x1={CELL_SIZE * 8.5}
            y1={CELL_SIZE * 2}
            x2={CELL_SIZE * 8.5}
            y2={CELL_SIZE * 6}
            stroke="#333"
            strokeWidth="3"
          />
          
          {/* Horizontal line */}
          <line
            x1={CELL_SIZE * 7}
            y1={CELL_SIZE * 4}
            x2={CELL_SIZE * 10}
            y2={CELL_SIZE * 4}
            stroke="#333"
            strokeWidth="3"
          />
          
          {/* Diamond inner cells (grid) */}
          {/* Vertical dividers in diamond */}
          <line
            x1={CELL_SIZE * 8.25}
            y1={CELL_SIZE * 2}
            x2={CELL_SIZE * 8.25}
            y2={CELL_SIZE * 6}
            stroke="#999"
            strokeWidth="1"
          />
          <line
            x1={CELL_SIZE * 8.75}
            y1={CELL_SIZE * 2}
            x2={CELL_SIZE * 8.75}
            y2={CELL_SIZE * 6}
            stroke="#999"
            strokeWidth="1"
          />
          
          {/* Horizontal dividers in diamond */}
          <line
            x1={CELL_SIZE * 7}
            y1={CELL_SIZE * 3}
            x2={CELL_SIZE * 10}
            y2={CELL_SIZE * 3}
            stroke="#999"
            strokeWidth="1"
          />
          <line
            x1={CELL_SIZE * 7}
            y1={CELL_SIZE * 5}
            x2={CELL_SIZE * 10}
            y2={CELL_SIZE * 5}
            stroke="#999"
            strokeWidth="1"
          />
          
          {/* Diagonal lines for diamond cells */}
          <line
            x1={CELL_SIZE * 8.5}
            y1={CELL_SIZE * 2}
            x2={CELL_SIZE * 7}
            y2={CELL_SIZE * 4}
            stroke="#999"
            strokeWidth="1"
          />
          <line
            x1={CELL_SIZE * 8.5}
            y1={CELL_SIZE * 2}
            x2={CELL_SIZE * 10}
            y2={CELL_SIZE * 4}
            stroke="#999"
            strokeWidth="1"
          />
          <line
            x1={CELL_SIZE * 7}
            y1={CELL_SIZE * 4}
            x2={CELL_SIZE * 8.5}
            y2={CELL_SIZE * 6}
            stroke="#999"
            strokeWidth="1"
          />
          <line
            x1={CELL_SIZE * 10}
            y1={CELL_SIZE * 4}
            x2={CELL_SIZE * 8.5}
            y2={CELL_SIZE * 6}
            stroke="#999"
            strokeWidth="1"
          />
        </svg>

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
