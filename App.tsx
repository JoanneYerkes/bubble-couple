
import React, { useState } from 'react';
import { GameMode } from './types';
import { useGameEngine } from './hooks/useGameEngine';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Menu from './components/Menu';
import { GRID_W, GRID_H, TILE_SIZE, HEADER_HEIGHT } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [winner, setWinner] = useState<number | null>(null);

  const handleGameOver = (winningId: number | null) => {
    setWinner(winningId);
  };

  const { gameStateRef, hudState, initGame, proceedToNextLevel } = useGameEngine(mode, handleGameOver);

  const handleRestart = () => {
    setWinner(null);
    initGame();
  };

  const handleModeSelect = (newMode: GameMode) => {
    setMode(newMode);
    setWinner(null);
  };

  // Calculate explicit dimensions to prevent layout collapse when Canvas is unmounted
  const gameWidth = GRID_W * TILE_SIZE;
  const gameHeight = GRID_H * TILE_SIZE;
  const totalHeight = gameHeight + HEADER_HEIGHT;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans select-none">
      {/* 
        Main Console Container
        This holds the HUD (Top Bar) and the Game Screen (Bottom)
      */}
      <div 
        className="relative shadow-2xl rounded-lg overflow-hidden bg-slate-800 border-4 border-slate-700 flex flex-col" 
        style={{ width: gameWidth, height: totalHeight }}
      >
        {/* HUD Layer - Always present in game mode, sits on top physically */}
        {mode !== GameMode.MENU && (
           <HUD hudState={hudState} onNextLevel={proceedToNextLevel} />
        )}
        
        {/* Game Canvas Layer */}
        {mode !== GameMode.MENU && (
           <div className="relative flex-1 bg-black">
             <GameCanvas gameStateRef={gameStateRef} />
           </div>
        )}
        
        {/* Menu & Overlay Layer (Absolute on top of everything) */}
        {(mode === GameMode.MENU || winner !== null) && (
            <Menu 
                setMode={handleModeSelect} 
                winner={winner} 
                onRestart={handleRestart}
                gameMode={mode}
            />
        )}
      </div>
    </div>
  );
};

export default App;
