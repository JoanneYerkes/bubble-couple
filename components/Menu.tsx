import React from 'react';
import { GameMode, SoundType } from '../types';
import { HeartHandshake, Swords, RotateCcw } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface MenuProps {
  setMode: (mode: GameMode) => void;
  winner: number | null;
  onRestart: () => void;
  gameMode: GameMode;
}

const Menu: React.FC<MenuProps> = ({ setMode, winner, onRestart, gameMode }) => {
  
  const handleModeSelect = (mode: GameMode) => {
    audioManager.init(); // Unlock AudioContext
    audioManager.play(SoundType.CLICK);
    setMode(mode);
  };

  const handleRestartClick = () => {
      audioManager.play(SoundType.CLICK);
      onRestart();
  };

  const handleBackToMenu = () => {
      audioManager.play(SoundType.CLICK);
      audioManager.stopBGM();
      setMode(GameMode.MENU);
  };

  if (gameMode === GameMode.MENU) {
    return (
      <div className="absolute inset-0 bg-[#FFDEE9] bg-gradient-to-br from-[#B5FFFC] to-[#FFDEE9] flex flex-col items-center justify-center p-8 z-50">
        
        {/* Title Block */}
        <div className="mb-10 bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
             <h1 className="text-6xl font-black text-black tracking-tight uppercase font-space">
                Bubble Couple
             </h1>
             <p className="text-black font-bold mt-2 text-center text-lg border-t-2 border-black pt-2">
                 Bombs, Bubbles & Betrayal
             </p>
        </div>

        <div className="flex gap-8 mb-12">
          {/* PVP Button */}
          <button
            onClick={() => handleModeSelect(GameMode.PVP)}
            onMouseEnter={() => audioManager.play(SoundType.CLICK)}
            className="group w-48 flex flex-col items-center gap-4 bg-[#FF6B6B] border-[3px] border-black p-6 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Swords size={48} className="text-black stroke-[2.5px]" />
            <div className="text-center">
              <h3 className="text-2xl font-black text-black uppercase">PvP</h3>
              <p className="text-xs font-bold text-black border-t-2 border-black mt-1 pt-1">Fight Partner</p>
            </div>
          </button>

          {/* PVE Button */}
          <button
            onClick={() => handleModeSelect(GameMode.PVE)}
            onMouseEnter={() => audioManager.play(SoundType.CLICK)}
            className="group w-48 flex flex-col items-center gap-4 bg-[#4ECDC4] border-[3px] border-black p-6 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <HeartHandshake size={48} className="text-black stroke-[2.5px]" />
            <div className="text-center">
              <h3 className="text-2xl font-black text-black uppercase">PvE</h3>
              <p className="text-xs font-bold text-black border-t-2 border-black mt-1 pt-1">Co-op Mode</p>
            </div>
          </button>
        </div>

        {/* Instructions */}
        <div className="w-full max-w-lg bg-white border-[3px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-center text-black font-black uppercase text-lg mb-4 bg-yellow-300 border-2 border-black inline-block px-2 transform -rotate-1 mx-auto block">How to Play</h4>
            <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-2">
                    <strong className="block text-black text-lg bg-blue-300 border-2 border-black text-center mb-2">P1 (Blue)</strong>
                    <div className="flex justify-between text-black font-bold"><span>Move</span> <span className="font-mono border border-black bg-gray-100 px-1">WASD</span></div>
                    <div className="flex justify-between text-black font-bold"><span>Bomb</span> <span className="font-mono border border-black bg-gray-100 px-1">Space</span></div>
                </div>
                <div className="space-y-2">
                    <strong className="block text-black text-lg bg-red-300 border-2 border-black text-center mb-2">P2 (Red)</strong>
                    <div className="flex justify-between text-black font-bold"><span>Move</span> <span className="font-mono border border-black bg-gray-100 px-1">Arrows</span></div>
                    <div className="flex justify-between text-black font-bold"><span>Bomb</span> <span className="font-mono border border-black bg-gray-100 px-1">Enter</span></div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (winner !== null) {
    return (
      <div className="absolute inset-0 bg-yellow-300 flex flex-col items-center justify-center p-8 z-50">
        <div className="bg-white border-[4px] border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center max-w-2xl w-full">
            <h2 className="text-6xl font-black mb-4 uppercase text-black italic">
                {winner === 0 ? "GAME OVER" : winner === 12 ? "VICTORY!" : `P${winner} WINS!`}
            </h2>
            <p className="text-2xl text-black font-bold mb-10 border-b-4 border-black inline-block pb-2">
                {winner === 0 ? "You both died..." : winner === 12 ? "Mission Accomplished!" : "Kneel before the champion!"}
            </p>
            
            <div className="flex flex-col gap-4 items-center">
                <button 
                    onClick={handleRestartClick}
                    className="flex items-center gap-3 px-8 py-4 bg-[#7FBC8C] border-[3px] border-black text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black text-xl transition-all"
                >
                    <RotateCcw className="stroke-[3px]" /> 
                    PLAY AGAIN
                </button>
                
                <button 
                    onClick={handleBackToMenu}
                    className="mt-4 font-bold border-b-2 border-black hover:text-gray-600 text-black uppercase tracking-widest"
                >
                    Back to Menu
                </button>
            </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Menu;