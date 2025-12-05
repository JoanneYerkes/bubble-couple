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
      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-50 p-8">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 tracking-wider filter drop-shadow-lg">
          Bubble Couple
        </h1>
        <p className="mb-12 text-slate-400 text-lg">A game of bombs, bubbles, and betrayal.</p>

        <div className="flex gap-8 mb-12">
          <button
            onClick={() => handleModeSelect(GameMode.PVP)}
            onMouseEnter={() => audioManager.play(SoundType.CLICK)}
            className="group w-48 flex flex-col items-center gap-4 bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-red-500 hover:bg-slate-750 transition-all transform hover:-translate-y-1 shadow-lg"
          >
            <Swords size={48} className="text-red-500 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-100">PvP Mode</h3>
              <p className="text-sm text-slate-400 mt-1">Fight your partner!</p>
            </div>
          </button>

          <button
            onClick={() => handleModeSelect(GameMode.PVE)}
            onMouseEnter={() => audioManager.play(SoundType.CLICK)}
            className="group w-48 flex flex-col items-center gap-4 bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-750 transition-all transform hover:-translate-y-1 shadow-lg"
          >
            <HeartHandshake size={48} className="text-blue-500 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-100">PvE Mode</h3>
              <p className="text-sm text-slate-400 mt-1">Practice together!</p>
            </div>
          </button>
        </div>

        <div className="w-full max-w-lg bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
            <h4 className="text-center text-slate-500 uppercase tracking-widest text-xs mb-4 font-bold">How to Play</h4>
            <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-2">
                    <strong className="text-blue-400 block text-base border-b border-blue-400/20 pb-1 mb-2">Player 1 (Blue)</strong>
                    <div className="flex justify-between text-slate-300"><span>Move</span> <span className="font-mono bg-slate-700 px-1 rounded">WASD</span></div>
                    <div className="flex justify-between text-slate-300"><span>Bomb</span> <span className="font-mono bg-slate-700 px-1 rounded">Space</span></div>
                </div>
                <div className="space-y-2">
                    <strong className="text-red-400 block text-base border-b border-red-400/20 pb-1 mb-2">Player 2 (Red)</strong>
                    <div className="flex justify-between text-slate-300"><span>Move</span> <span className="font-mono bg-slate-700 px-1 rounded">Arrows</span></div>
                    <div className="flex justify-between text-slate-300"><span>Bomb</span> <span className="font-mono bg-slate-700 px-1 rounded">Enter</span></div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (winner !== null) {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white z-50 animate-in fade-in duration-500">
        <h2 className="text-6xl font-black mb-4 tracking-tight drop-shadow-xl">
            {winner === 0 ? <span className="text-slate-400">GAME OVER</span> : <span className={winner === 1 ? 'text-blue-500' : winner === 12 ? 'text-yellow-500' : 'text-red-500'}>{winner === 12 ? "VICTORY!" : `PLAYER ${winner} WINS!`}</span>}
        </h2>
        <p className="text-2xl text-slate-300 mb-10 font-light">
            {winner === 0 ? "Better luck next time..." : winner === 12 ? "Great Teamwork!" : "Victory is sweet!"}
        </p>
        
        <button 
            onClick={handleRestartClick}
            className="group flex items-center gap-3 px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-xl"
        >
            <RotateCcw className="group-hover:-rotate-180 transition-transform duration-500" /> 
            Play Again
        </button>
        
        <button 
            onClick={handleBackToMenu}
            className="mt-8 text-slate-500 hover:text-white transition-colors text-sm uppercase tracking-widest"
        >
            Back to Menu
        </button>
      </div>
    );
  }

  return null;
};

export default Menu;