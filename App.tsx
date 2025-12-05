
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

  // Calculate explicit dimensions
  const gameWidth = GRID_W * TILE_SIZE;
  const gameHeight = GRID_H * TILE_SIZE;
  const totalHeight = gameHeight + HEADER_HEIGHT;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 select-none">
      {/* 
        Main Console Container
        Neobrutalist Style: Thick borders, hard shadow, no rounded corners (or slight)
      */}
      <div 
        className="relative bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col" 
        style={{ width: gameWidth, height: totalHeight }}
      >
        {/* HUD Layer */}
        {mode !== GameMode.MENU && (
           <HUD hudState={hudState} onNextLevel={proceedToNextLevel} />
        )}
        
        {/* Game Canvas Layer */}
        {mode !== GameMode.MENU && (
           <div className="relative flex-1 bg-white border-t-[4px] border-black">
             <GameCanvas gameStateRef={gameStateRef} />
           </div>
        )}
        
        {/* Menu & Overlay Layer */}
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
