
import React, { useState, useEffect } from 'react';
import { GameMode } from './types';
import { useGameEngine } from './hooks/useGameEngine';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Menu from './components/Menu';
import TouchControls from './components/TouchControls';
import { GRID_W, GRID_H, TILE_SIZE, HEADER_HEIGHT } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [winner, setWinner] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);

  // Calculate explicit dimensions
  const gameWidth = GRID_W * TILE_SIZE;
  const gameHeight = GRID_H * TILE_SIZE;
  const totalHeight = gameHeight + HEADER_HEIGHT;

  useEffect(() => {
    const checkMobile = () => {
      const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      return hasTouchSupport && isSmallScreen;
    };

    const calculateScale = () => {
      const mobile = checkMobile();
      if (mobile) {
        // Calculate scale to fit screen width with some padding
        const availableWidth = window.innerWidth - 16; // 8px padding on each side
        const newScale = Math.min(1, availableWidth / gameWidth);
        setScale(newScale);
      } else {
        setScale(1);
      }
      return mobile;
    };
    
    const handleResize = () => {
      setIsMobile(calculateScale());
    };
    
    setIsMobile(calculateScale());
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [gameWidth]);

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

  const handleExit = () => {
    setMode(GameMode.MENU);
    setWinner(null);
  };

  // Calculate the scaled dimensions for the container wrapper
  const scaledWidth = gameWidth * scale;
  const scaledHeight = (isMobile ? gameHeight : totalHeight) * scale;

  return (
    <div className={`min-h-screen flex flex-col items-center select-none overflow-hidden ${isMobile ? 'justify-start pt-2' : 'justify-center'}`}>
      {/* Mobile HUD - Fixed at top, full width */}
      {isMobile && mode !== GameMode.MENU && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#E0E7F1]" style={{ height: HEADER_HEIGHT * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: gameWidth }}>
            <HUD hudState={hudState} onNextLevel={proceedToNextLevel} onExit={handleExit} />
          </div>
        </div>
      )}
      
      {/* 
        Main Console Container Wrapper
        This wrapper provides the scaled dimensions for proper layout
      */}
      <div 
        className="relative"
        style={{ 
          width: scaledWidth, 
          height: scaledHeight,
          marginTop: isMobile && mode !== GameMode.MENU ? HEADER_HEIGHT * scale + 4 : 0,
        }}
      >
        {/* 
          Main Console Container
          Neobrutalist Style: Thick borders, hard shadow, no rounded corners (or slight)
          The actual game content that gets scaled on mobile
        */}
        <div 
          className="bg-white border-[3px] sm:border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col"
          style={{ 
            width: gameWidth, 
            height: isMobile ? gameHeight : totalHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* HUD Layer - Only show in container on desktop */}
          {!isMobile && mode !== GameMode.MENU && (
             <HUD hudState={hudState} onNextLevel={proceedToNextLevel} onExit={handleExit} />
          )}
          
          {/* Game Canvas Layer */}
          {mode !== GameMode.MENU && (
             <div className={`relative flex-1 bg-white ${!isMobile ? 'border-t-[4px] border-black' : ''}`}>
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
      
      {/* Touch Controls for Mobile - Only show during gameplay */}
      {mode !== GameMode.MENU && winner === null && (
        <TouchControls playerId={1} />
      )}
    </div>
  );
};

export default App;
