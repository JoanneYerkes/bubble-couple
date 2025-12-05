
import React, { useState } from 'react';
import { GameState, PlayerState, GameMode } from '../types';
import { Heart, Bomb, Zap, Skull, Clock, Volume2, VolumeX, Flag, Star, Trophy, ArrowRight } from 'lucide-react';
import { HEADER_HEIGHT } from '../constants';
import { audioManager } from '../utils/audio';

interface HUDProps {
  hudState: GameState | null;
  onNextLevel?: () => void;
}

const HUD: React.FC<HUDProps> = ({ hudState, onNextLevel }) => {
  const [isMuted, setIsMuted] = useState(audioManager.getMuteState());

  const toggleMute = () => {
    const newState = audioManager.toggleMute();
    setIsMuted(newState);
  };

  if (!hudState) return null;

  const p1 = hudState.players.find(p => p.id === 1);
  const p2 = hudState.players.find(p => p.id === 2);

  const renderPlayerStats = (p: any, label: string, alignRight: boolean = false) => (
    <div className={`flex items-center gap-4 ${p.state === PlayerState.DEAD ? 'grayscale opacity-60' : ''} ${alignRight ? 'flex-row-reverse' : ''}`}>
       {/* Avatar */}
       <div className="relative">
          <div 
            className="w-12 h-12 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" 
            style={{ backgroundColor: p.color }}
          ></div>
          {p.state === PlayerState.TRAPPED && (
             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-1 border border-black animate-bounce">SOS</span>
          )}
       </div>

       {/* Stats Block */}
       <div className={`flex flex-col ${alignRight ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-black text-sm bg-white border border-black px-1 uppercase">{label}</span>
              <div className="flex items-center gap-1 bg-yellow-300 px-1.5 border border-black font-bold text-xs text-black">
                  <Star size={10} fill="black" strokeWidth={3} />
                  <span>{p.score}</span>
              </div>
          </div>
          
          {p.state === PlayerState.TRAPPED ? (
              <div className="text-red-600 font-black text-sm animate-pulse bg-red-100 px-1 border border-red-600">
                  TRAPPED {(p.trappedTimer / 1000).toFixed(1)}s
              </div>
          ) : p.state === PlayerState.DEAD ? (
              <div className="text-gray-500 font-black text-sm bg-gray-200 px-1 border border-gray-500">
                  ELIMINATED
              </div>
          ) : (
              <div className="flex gap-2 text-xs font-bold text-black">
                  <div className="flex items-center gap-1 bg-gray-100 border border-black px-1">
                      <Bomb size={12} className="text-black" />
                      <span>{p.activeBombs}/{p.maxBombs}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 border border-black px-1">
                      <Zap size={12} className="text-black" />
                      <span>{p.bombRange}</span>
                  </div>
              </div>
          )}
       </div>
    </div>
  );

  return (
    <div 
      className="w-full bg-[#E0E7F1] flex items-center justify-between px-6 z-10 relative select-none"
      style={{ height: HEADER_HEIGHT }}
    >
        {/* P1 Stats */}
        <div className="flex-1">
            {p1 && renderPlayerStats(p1, "P1 (YOU)")}
        </div>
        
        {/* Center: Timer & Controls */}
        <div className="flex items-center gap-4">
             <button 
                onClick={toggleMute}
                className="w-10 h-10 flex items-center justify-center bg-white border-[3px] border-black hover:bg-gray-100 active:translate-y-1 active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
             >
                 {isMuted ? <VolumeX size={20} className="text-black" /> : <Volume2 size={20} className="text-black" />}
             </button>

             <div className="flex flex-col items-center justify-center">
                 {/* Level Indicator */}
                 <div className="flex items-center gap-1 bg-black text-white px-2 py-0.5 text-xs font-bold mb-1 border border-black -rotate-1">
                     <Flag size={10} />
                     <span>STAGE {hudState.level}</span>
                 </div>

                 <div className="flex items-center justify-center bg-white px-4 py-1 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-black" strokeWidth={3} />
                        <span className={`text-xl font-mono font-black ${hudState.timeLeft <= 30 ? 'text-red-600' : 'text-black'}`}>
                            {Math.floor(hudState.timeLeft)}s
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* P2 Stats */}
        <div className="flex-1 flex justify-end">
            {p2 && renderPlayerStats(p2, "P2 (ALLY)", true)}
        </div>

        {/* Level Transition Overlay */}
        {hudState.isLevelClear && (
            <div className="absolute inset-0 top-full h-[600px] flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                 <div className="bg-white p-8 border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center max-w-md w-full relative">
                     
                     <h2 className="text-4xl font-black text-black bg-yellow-300 border-[3px] border-black inline-block px-4 py-2 transform -rotate-2 mb-6 uppercase">
                         Stage Clear!
                     </h2>
                     
                     {/* Stats Table */}
                     <div className="bg-gray-50 border-[3px] border-black p-4 mb-8">
                        <div className="grid grid-cols-3 gap-4 mb-2 text-xs font-black text-black uppercase pb-2 border-b-2 border-black">
                            <span className="text-left">Player</span>
                            <span className="text-center">Kills</span>
                            <span className="text-right">Status</span>
                        </div>
                        
                        {/* P1 */}
                        {p1 && (
                            <div className="grid grid-cols-3 gap-4 py-2 items-center border-b border-gray-300">
                                <div className="flex items-center gap-2 text-black font-bold">
                                    <div className="w-3 h-3 bg-blue-500 border border-black"></div> P1
                                </div>
                                <div className="text-center font-mono text-xl font-bold">{p1.score}</div>
                                <div className="text-right text-xs font-black text-green-600 bg-green-100 border border-green-600 px-1 inline-block">ALIVE</div>
                            </div>
                        )}
                        
                        {/* P2 */}
                        {p2 && (
                            <div className="grid grid-cols-3 gap-4 py-2 items-center">
                                <div className="flex items-center gap-2 text-black font-bold">
                                    <div className="w-3 h-3 bg-red-500 border border-black"></div> P2
                                </div>
                                <div className="text-center font-mono text-xl font-bold">{p2.score}</div>
                                <div className="text-right text-xs font-black text-green-600 bg-green-100 border border-green-600 px-1 inline-block">ALIVE</div>
                            </div>
                        )}
                     </div>

                     <button 
                        onClick={onNextLevel}
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#7FBC8C] hover:bg-[#68a375] border-[3px] border-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black font-black text-xl transition-all"
                     >
                         <span>NEXT MISSION</span>
                         <ArrowRight className="stroke-[3px]" />
                     </button>
                 </div>
            </div>
        )}
    </div>
  );
};

export default HUD;
