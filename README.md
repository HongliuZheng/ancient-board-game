# ancient-board-game
This is the repo to host the game Corner the Bull

Configuration Files:

package.json - Dependencies and scripts
tsconfig.json - TypeScript configuration
tsconfig.node.json - Node TypeScript config
vite.config.ts - Vite build configuration
.gitignore - Git ignore patterns
Game Logic:

src/types.ts - Type definitions
src/engine/GameEngine.ts - Core game engine
React Components:

src/components/GameBoard.tsx - Main game board component
src/components/GameBoard.css - Beautiful game styling
src/App.tsx - Main app component
src/App.css - App styles
src/main.tsx - React entry point
src/index.css - Global styles

To run the app:
Clone the repo locally: git clone https://github.com/HongliuZheng/ancient-board-game.git
Install dependencies: npm install
Run the game: npm run dev
If there is css or npm package changes:
run: rm -rf node_modules package-lock.json dist .next .cache && npm cache clean --force && npm install
If you are on Windows PowerShell, use:
 Remove-Item -Recurse -Force node_modules, package-lock.json, dist, .next, .cache
