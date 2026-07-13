# copilot-instructions

- This repo is a small React + TypeScript Vite app for an 8x8 board game.
- The core game rules and state live in `src/engine/GameEngine.ts`; the UI is in `src/components/GameBoard.tsx` and `src/App.tsx`.
- Do not restructure the app into a new state management system unless needed; the current pattern relies on a single `GameEngine` instance stored in React state:
  - `const [engine] = useState(() => new GameEngine())`
  - UI updates are triggered by calling `setGameState({ ...engine.getState() })`
- Coordinate logic uses `{ x, y }` positions on an 8x8 board with `LATRINE_POS = { x: 3, y: 3 }`, so preserve that coordinate model.
- `GameEngine.movePiece()` expects a selected piece and a destination from `state.validMoves`; it also updates capture state and alternates `currentPlayer`.
- Capture logic is in `checkSandwichCapture()` and `checkCarryCapture()`; note `hasBlockingPieces()` is currently a TODO and should be treated as an existing stub.
- The game state shape is defined in `src/types.ts`; key fields are `pieces`, `currentPlayer`, `selectedPiece`, `validMoves`, `reserves`, `gameStatus`, and `moveHistory`.
- React UI only renders pieces not in latrine (`!piece.isInLatrine`) and highlights valid move targets via CSS classes in `src/components/GameBoard.css`.
- Use the existing Vite commands from `package.json`:
  - `npm run dev` for local development
  - `npm run build` for production bundle
  - `npm run preview` to preview the built app
  - `npm run lint` to lint `src` files
- `vite.config.ts` opens the browser on port `3000`; avoid changing it unless the task is about dev server configuration.
- The entry point is `src/main.tsx`; `App.tsx` only renders `<GameBoard />`.
- No dedicated tests or CI rules are present, so prioritize correctness by keeping behavior aligned with the existing engine/UI interaction.
- If making UI changes, preserve the current two-step move flow: click a player piece, then click a destination cell.

If any part of the board logic or state flow is unclear, ask before changing the `GameEngine` interface or the board rendering model.