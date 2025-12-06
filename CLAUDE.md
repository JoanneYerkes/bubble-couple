# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bubble Couple is a 2-player cooperative/competitive bomberman-style game built with React, TypeScript, and Vite. Players place bombs to defeat enemies (PvE mode) or each other (PvP mode) while collecting power-ups and avoiding traps.

## Key Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker (for deployment)
```bash
# Build Docker image
docker build -t bubble-couple .

# Run with Docker
docker run -p 3000:80 bubble-couple

# Or use Docker Compose
docker-compose up
```

## Game Architecture

### Core Systems
- **Game Engine**: `hooks/useGameEngine.ts` - Main game loop and state management using React refs for performance
- **Game Canvas**: `components/GameCanvas.tsx` - WebGL/Canvas rendering for game entities
- **Input System**: Keyboard and gamepad support with mapping in `constants.ts`
- **Audio System**: `utils/audio.ts` - Sound effects and background music management
- **Physics/Collision**: Grid-based movement with corner sliding and bomb kicking mechanics

### Game State
The game uses a centralized `GameState` interface in `types.ts` containing:
- Grid system with walls and items
- Players with stats (speed, bomb range, power-ups)
- Enemies with AI behaviors
- Bombs with explosion chaining
- Level progression system

### Level Design
- Pre-configured levels in `constants.ts` with enemy spawning and boss fights
- Progressive difficulty with wall density and enemy types
- Boss mechanics: Slime spawns minions, Mecha places mega bombs

### Game Modes
- **PvE** (Player vs Environment): Co-op campaign against AI enemies
- **PvP** (Player vs Player): 1v1 competitive mode

### Mobile Support
- Touch controls via `components/TouchControls.tsx`
- Responsive layout with neobrutalist styling
- Auto-detects mobile devices and adapts UI

## Key Technical Details

### Performance
- Uses React refs instead of state for game entities to avoid render cycles
- 60 FPS game loop with `requestAnimationFrame`
- Grid-based collision detection for efficiency

### Input Handling
- Supports both keyboard (WASD/Arrows + Space/Enter) and Xbox controllers
- Gamepad mapping: Player 1 uses first connected controller, Player 2 uses second
- Touch controls for mobile with on-screen D-pad and bomb button

### Physics
- Corner sliding allows smoother movement around corners
- Bomb kicking mechanic when player has kick power-up
- Enemy AI with pathfinding and different movement patterns per enemy type

## Dependencies
- React 19.2.1 for UI framework
- TypeScript for type safety
- Vite for bundling and development
- Tailwind CSS for styling
- Lucide React for icons

## Environment Variables
- `GEMINI_API_KEY` - Optional Gemini API key for AI features (configured in vite.config.ts)

## File Structure
- `src/types.ts` - All type definitions
- `src/constants.ts` - Game configuration and level data
- `src/hooks/` - Custom React hooks for game logic
- `src/components/` - React components for UI and game rendering
- `src/utils/` - Utility functions for game mechanics and audio