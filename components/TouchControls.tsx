import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle } from 'lucide-react';
import { CONTROLS } from '../constants';

interface TouchControlsProps {
  playerId: 1 | 2;
}

const TouchControls: React.FC<TouchControlsProps> = ({ playerId }) => {
  const [isMobile, setIsMobile] = useState(false);
  const activeButtons = useRef<Set<string>>(new Set());
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    setIsMobile(checkMobile());
  }, []);

  const keyMap = playerId === 1 ? {
    up: CONTROLS.P1.UP,
    down: CONTROLS.P1.DOWN,
    left: CONTROLS.P1.LEFT,
    right: CONTROLS.P1.RIGHT,
    bomb: CONTROLS.P1.BOMB,
  } : {
    up: CONTROLS.P2.UP,
    down: CONTROLS.P2.DOWN,
    left: CONTROLS.P2.LEFT,
    right: CONTROLS.P2.RIGHT,
    bomb: CONTROLS.P2.BOMB,
  };

  const simulateKeyEvent = (code: string, type: 'keydown' | 'keyup') => {
    // Map code to key value for proper event simulation
    const keyMap: { [key: string]: string } = {
      'KeyW': 'w',
      'KeyS': 's',
      'KeyA': 'a',
      'KeyD': 'd',
      'Space': ' ',
      'ArrowUp': 'ArrowUp',
      'ArrowDown': 'ArrowDown',
      'ArrowLeft': 'ArrowLeft',
      'ArrowRight': 'ArrowRight',
      'Enter': 'Enter',
    };
    
    const event = new KeyboardEvent(type, {
      code,
      key: keyMap[code] || code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  const handleTouchStart = (direction: 'up' | 'down' | 'left' | 'right' | 'bomb') => (e: React.TouchEvent) => {
    e.preventDefault();
    const buttonId = `${direction}-${playerId}`;
    
    if (!activeButtons.current.has(buttonId)) {
      activeButtons.current.add(buttonId);
      const keyCode = keyMap[direction];
      if (!pressedKeys.current.has(keyCode)) {
        pressedKeys.current.add(keyCode);
        simulateKeyEvent(keyCode, 'keydown');
      }
    }
  };

  const handleTouchEnd = (direction: 'up' | 'down' | 'left' | 'right' | 'bomb') => (e: React.TouchEvent) => {
    e.preventDefault();
    const buttonId = `${direction}-${playerId}`;
    
    if (activeButtons.current.has(buttonId)) {
      activeButtons.current.delete(buttonId);
      const keyCode = keyMap[direction];
      if (pressedKeys.current.has(keyCode)) {
        pressedKeys.current.delete(keyCode);
        simulateKeyEvent(keyCode, 'keyup');
      }
    }
  };

  const handleTouchCancel = (direction: 'up' | 'down' | 'left' | 'right' | 'bomb') => (e: React.TouchEvent) => {
    // Same as touch end - release the key when touch is cancelled
    handleTouchEnd(direction)(e);
  };

  // Only render on mobile
  if (!isMobile) return null;

  const bgColor = playerId === 1 ? 'bg-blue-500' : 'bg-red-500';
  const borderColor = playerId === 1 ? 'border-blue-700' : 'border-red-700';

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-end justify-between p-2 sm:p-4 gap-2 sm:gap-4">
      {/* D-Pad (Left Side) */}
      <div className="pointer-events-auto relative w-28 h-28 sm:w-32 sm:h-32 mb-4 sm:mb-8">
        {/* Up */}
        <button
          onTouchStart={handleTouchStart('up')}
          onTouchEnd={handleTouchEnd('up')}
          onTouchCancel={handleTouchCancel('up')}
          className={`absolute left-1/2 top-0 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 ${bgColor} border-2 ${borderColor} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center`}
        >
          <ArrowUp size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={3} />
        </button>
        {/* Down */}
        <button
          onTouchStart={handleTouchStart('down')}
          onTouchEnd={handleTouchEnd('down')}
          onTouchCancel={handleTouchCancel('down')}
          className={`absolute left-1/2 bottom-0 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 ${bgColor} border-2 ${borderColor} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center`}
        >
          <ArrowDown size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={3} />
        </button>
        {/* Left */}
        <button
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onTouchCancel={handleTouchCancel('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 ${bgColor} border-2 ${borderColor} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center`}
        >
          <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={3} />
        </button>
        {/* Right */}
        <button
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onTouchCancel={handleTouchCancel('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 ${bgColor} border-2 ${borderColor} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center`}
        >
          <ArrowRight size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={3} />
        </button>
        {/* Center indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-white border-2 border-black rounded-full" />
      </div>

      {/* Bomb Button (Right Side) */}
      <div className="pointer-events-auto mb-4 sm:mb-8">
        <button
          onTouchStart={handleTouchStart('bomb')}
          onTouchEnd={handleTouchEnd('bomb')}
          onTouchCancel={handleTouchCancel('bomb')}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${bgColor} border-[3px] sm:border-[4px] ${borderColor} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center relative`}
        >
          <span className="text-white font-black text-2xl sm:text-3xl">💣</span>
        </button>
      </div>
    </div>
  );
};

export default TouchControls;
