
import React, { useState } from 'react';
import { GameState, PlayerState, GameMode } from '../types';
import { Heart, Bomb, Zap, Skull, Clock, Volume2, VolumeX, Flag, Star, Trophy, ArrowRight, LogOut } from 'lucide-react';
import { HEADER_HEIGHT } from '../constants';
import { audioManager } from '../utils/audio';

interface HUDProps {
  hudState: GameState | null;
  onNextLevel?: () => void;
  onExit?: () => void;
}

const HUD: React.FC<HUDProps> = ({ hudState, onNextLevel, onExit }) => {
  const [isMuted, setIsMuted] = useState(audioManager.getMuteState());

  const toggleMute = () => {
    const newState = audioManager.toggleMute();
    setIsMuted(newState);
  };

  if (!hudState) return null;

  const p1 = hudState.players.find(p => p.id === 1);
  const p2 = hudState.players.find(p => p.id === 2);

  const renderPlayerStats = (p: any, label: string, alignRight: boolean = false) => (
    <div className={`flex items-center gap-1 sm:gap-4 ${p.state === PlayerState.DEAD ? 'grayscale opacity-60' : ''} ${alignRight ? 'flex-row-reverse' : ''}`}>
       {/* Avatar */}
       <div className="relative">
          <div 
            className="w-8 h-8 sm:w-12 sm:h-12 border-[2px] sm:border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" 
            style={{ backgroundColor: p.color }}
          ></div>
          {p.state === PlayerState.TRAPPED && (
             <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-0.5 sm:px-1 border border-black animate-bounce">SOS</span>
          )}
       </div>

       {/* Stats Block */}
       <div className={`flex flex-col ${alignRight ? 'items-end' : 'items-start'} min-w-0`}>
          <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
              <span className="font-black text-black text-[10px] sm:text-sm bg-white border border-black px-0.5 sm:px-1 uppercase hidden sm:inline">{label}</span>
              <span className="font-black text-black text-[10px] bg-white border border-black px-0.5 uppercase inline sm:hidden">{p.id === 1 ? 'P1' : 'P2'}</span>
              <div className="flex items-center gap-0.5 sm:gap-1 bg-yellow-300 px-1 sm:px-1.5 border border-black font-bold text-[10px] sm:text-xs text-black">
                  <Star size={8} fill="black" strokeWidth={3} className="sm:w-2.5 sm:h-2.5" />
                  <span>{p.score}</span>
              </div>
          </div>
          
          {p.state === PlayerState.TRAPPED ? (
              <div className="text-red-600 font-black text-[10px] sm:text-sm animate-pulse bg-red-100 px-0.5 sm:px-1 border border-red-600 truncate">
                  TRAPPED {(p.trappedTimer / 1000).toFixed(1)}s
              </div>
          ) : p.state === PlayerState.DEAD ? (
              <div className="text-gray-500 font-black text-[10px] sm:text-sm bg-gray-200 px-0.5 sm:px-1 border border-gray-500 truncate">
                  DEAD
              </div>
          ) : (
              <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold text-black">
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 border border-black px-0.5 sm:px-1">
                      <Bomb size={10} className="text-black sm:w-3 sm:h-3" />
                      <span>{p.activeBombs}/{p.maxBombs}</span>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 border border-black px-0.5 sm:px-1">
                      <Zap size={10} className="text-black sm:w-3 sm:h-3" />
                      <span>{p.bombRange}</span>
                  </div>
              </div>
          )}
       </div>
    </div>
  );

  return (
    <div 
      className="w-full bg-[#E0E7F1] flex items-center justify-between px-2 sm:px-6 z-10 relative select-none"
      style={{ height: HEADER_HEIGHT }}
    >
        {/* P1 Stats */}
        <div className="flex-1 min-w-0">
            {p1 && renderPlayerStats(p1, "P1 (YOU)")}
        </div>
        
        {/* Center: Timer & Controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
             <button 
                onClick={onExit}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-red-400 hover:bg-red-500 border-[2px] sm:border-[3px] border-black active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                title="退出游戏"
             >
                 <LogOut size={16} className="text-black sm:w-5 sm:h-5" />
             </button>
             <button 
                onClick={toggleMute}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white border-[2px] sm:border-[3px] border-black hover:bg-gray-100 active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
             >
                 {isMuted ? <VolumeX size={16} className="text-black sm:w-5 sm:h-5" /> : <Volume2 size={16} className="text-black sm:w-5 sm:h-5" />}
             </button>

             <div className="flex flex-col items-center justify-center">
                 {/* Level Indicator */}
                 <div className="flex items-center gap-1 bg-black text-white px-1 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold mb-1 border border-black -rotate-1">
                     <Flag size={8} className="sm:w-2.5 sm:h-2.5" />
                     <span className="hidden sm:inline">STAGE {hudState.level}</span>
                     <span className="inline sm:hidden">{hudState.level}</span>
                 </div>

                 <div className="flex items-center justify-center bg-white px-2 sm:px-4 py-0.5 sm:py-1 border-[2px] sm:border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Clock size={12} className="text-black sm:w-4 sm:h-4" strokeWidth={3} />
                        <span className={`text-base sm:text-xl font-mono font-black ${hudState.timeLeft <= 30 ? 'text-red-600' : 'text-black'}`}>
                            {Math.floor(hudState.timeLeft)}s
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* P2 Stats */}
        <div className="flex-1 flex justify-end min-w-0">
            {p2 && renderPlayerStats(p2, "P2 (ALLY)", true)}
        </div>

        {/* Level Transition Overlay */}
        {hudState.isLevelClear && (
            <div className="absolute inset-0 top-full h-[600px] flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
                 <div className="bg-white p-4 sm:p-8 border-[3px] sm:border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center max-w-md w-full relative">
                     
                     <h2 className="text-2xl sm:text-4xl font-black text-black bg-yellow-300 border-[3px] border-black inline-block px-3 sm:px-4 py-1 sm:py-2 transform -rotate-2 mb-4 sm:mb-6 uppercase">
                         Stage Clear!
                     </h2>
                     
                     {/* Stats Table */}
                     <div className="bg-gray-50 border-[3px] border-black p-3 sm:p-4 mb-4 sm:mb-8">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2 text-[10px] sm:text-xs font-black text-black uppercase pb-2 border-b-2 border-black">
                            <span className="text-left">Player</span>
                            <span className="text-center">Kills</span>
                            <span className="text-right">Status</span>
                        </div>
                        
                        {/* P1 */}
                        {p1 && (
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-1 sm:py-2 items-center border-b border-gray-300">
                                <div className="flex items-center gap-1 sm:gap-2 text-black font-bold text-xs sm:text-base">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 border border-black"></div> P1
                                </div>
                                <div className="text-center font-mono text-lg sm:text-xl font-bold">{p1.score}</div>
                                <div className="text-right text-[10px] sm:text-xs font-black text-green-600 bg-green-100 border border-green-600 px-0.5 sm:px-1 inline-block">ALIVE</div>
                            </div>
                        )}
                        
                        {/* P2 */}
                        {p2 && (
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-1 sm:py-2 items-center">
                                <div className="flex items-center gap-1 sm:gap-2 text-black font-bold text-xs sm:text-base">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 border border-black"></div> P2
                                </div>
                                <div className="text-center font-mono text-lg sm:text-xl font-bold">{p2.score}</div>
                                <div className="text-right text-[10px] sm:text-xs font-black text-green-600 bg-green-100 border border-green-600 px-0.5 sm:px-1 inline-block">ALIVE</div>
                            </div>
                        )}
                     </div>

                     <button 
                        onClick={onNextLevel}
                        className="w-full flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-4 bg-[#7FBC8C] hover:bg-[#68a375] border-[3px] border-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black font-black text-lg sm:text-xl transition-all"
                     >
                         <span>NEXT MISSION</span>
                         <ArrowRight className="stroke-[3px] w-5 h-5 sm:w-6 sm:h-6" />
                     </button>
                 </div>
            </div>
        )}
    </div>
  );
};

export default HUD;
