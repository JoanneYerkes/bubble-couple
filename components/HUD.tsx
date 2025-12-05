
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
    <div className={`flex items-center gap-4 ${p.state === PlayerState.DEAD ? 'opacity-50 grayscale' : ''} ${alignRight ? 'flex-row-reverse' : ''}`}>
       {/* Avatar */}
       <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: p.color }}></div>
          {p.state === PlayerState.TRAPPED && (
             <span className="absolute -top-1 -right-1 flex h-4 w-4">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
             </span>
          )}
       </div>

       {/* Stats Block */}
       <div className={`flex flex-col ${alignRight ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-white text-sm tracking-wide">{label}</span>
              <div className="flex items-center gap-1 bg-black/40 px-1.5 rounded text-xs text-yellow-400 border border-yellow-500/30">
                  <Star size={10} fill="currentColor" />
                  <span>{p.score}</span>
              </div>
          </div>
          
          {p.state === PlayerState.TRAPPED ? (
              <div className="text-red-400 font-bold text-xs animate-pulse">
                  HELP! {(p.trappedTimer / 1000).toFixed(1)}s
              </div>
          ) : p.state === PlayerState.DEAD ? (
              <div className="text-gray-500 font-bold text-xs flex items-center gap-1">
                  <Skull size={12}/> ELIMINATED
              </div>
          ) : (
              <div className="flex gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded">
                      <Bomb size={12} className="text-yellow-400" />
                      <span>{p.activeBombs}/{p.maxBombs}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded">
                      <Zap size={12} className="text-blue-400" />
                      <span>{p.bombRange}</span>
                  </div>
              </div>
          )}
       </div>
    </div>
  );

  return (
    <div 
      className="w-full bg-slate-900 border-b-4 border-slate-700 flex items-center justify-between px-6 shadow-md z-10 relative"
      style={{ height: HEADER_HEIGHT }}
    >
        {/* P1 Stats */}
        <div className="flex-1">
            {p1 && renderPlayerStats(p1, "YOU (P1)")}
        </div>
        
        {/* Center: Timer & Controls */}
        <div className="flex items-center gap-4">
             <button 
                onClick={toggleMute}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
             >
                 {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
             </button>

             <div className="flex flex-col items-center justify-center">
                 {/* Level Indicator */}
                 <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mb-1">
                     <Flag size={10} />
                     <span>STAGE {hudState.level}</span>
                 </div>

                 <div className="flex flex-col items-center justify-center bg-slate-800 px-6 py-1 rounded-lg border border-slate-700 shadow-inner">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-500" />
                        <span className={`text-xl font-mono font-bold ${hudState.timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {Math.floor(hudState.timeLeft)}s
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* P2 Stats */}
        <div className="flex-1 flex justify-end">
            {p2 && renderPlayerStats(p2, "PARTNER (P2)", true)}
        </div>

        {/* Level Transition Overlay */}
        {hudState.isLevelClear && (
            <div className="absolute inset-0 top-full h-[600px] flex items-center justify-center z-50 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
                 <div className="bg-slate-800 p-8 rounded-2xl border-4 border-slate-600 text-white text-center shadow-2xl max-w-md w-full relative overflow-hidden">
                     {/* Decorative glow */}
                     <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>
                     <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

                     <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-2 drop-shadow-sm uppercase tracking-wider">
                         Stage Clear!
                     </h2>
                     <p className="text-slate-400 text-sm mb-8 font-mono">Stage {hudState.level} Complete</p>
                     
                     {/* Stats Table */}
                     <div className="bg-slate-900/50 rounded-xl p-4 mb-8 border border-slate-700">
                        <div className="grid grid-cols-3 gap-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-700">
                            <span className="text-left">Player</span>
                            <span className="text-center">Kills</span>
                            <span className="text-right">Status</span>
                        </div>
                        
                        {/* P1 */}
                        {p1 && (
                            <div className="grid grid-cols-3 gap-4 py-2 items-center">
                                <div className="flex items-center gap-2 text-blue-400 font-bold">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> P1
                                </div>
                                <div className="text-center font-mono text-xl">{p1.score}</div>
                                <div className="text-right text-xs text-green-400">ALIVE</div>
                            </div>
                        )}
                        
                        {/* P2 */}
                        {p2 && (
                            <div className="grid grid-cols-3 gap-4 py-2 items-center">
                                <div className="flex items-center gap-2 text-red-400 font-bold">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div> P2
                                </div>
                                <div className="text-center font-mono text-xl">{p2.score}</div>
                                <div className="text-right text-xs text-green-400">ALIVE</div>
                            </div>
                        )}
                     </div>

                     <button 
                        onClick={onNextLevel}
                        className="w-full group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl hover:shadow-blue-500/25"
                     >
                         <span>Next Mission</span>
                         <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                     </button>
                 </div>
            </div>
        )}
    </div>
  );
};

export default HUD;
