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
    // Detect mobile device - must be both touch-capable AND small screen
    const checkMobile = () => {
      const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      return hasTouchSupport && isSmallScreen;
    };
    
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
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
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-end justify-between px-4 pb-10 sm:px-6 sm:pb-16 gap-4">
      {/* D-Pad (Left Side) */}
      <div className="pointer-events-auto relative w-36 h-36 sm:w-40 sm:h-40">
        {/* Up */}
        <button
          onTouchStart={handleTouchStart('up')}
          onTouchEnd={handleTouchEnd('up')}
          onTouchCancel={handleTouchCancel('up')}
          className={`absolute left-1/2 top-0 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 ${bgColor} border-2 ${borderColor} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center`}
        >
          <ArrowUp size={24} className="text-white sm:w-7 sm:h-7" strokeWidth={3} />
        </button>
        {/* Down */}
        <button
          onTouchStart={handleTouchStart('down')}
          onTouchEnd={handleTouchEnd('down')}
          onTouchCancel={handleTouchCancel('down')}
          className={`absolute left-1/2 bottom-0 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 ${bgColor} border-2 ${borderColor} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center`}
        >
          <ArrowDown size={24} className="text-white sm:w-7 sm:h-7" strokeWidth={3} />
        </button>
        {/* Left */}
        <button
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onTouchCancel={handleTouchCancel('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 ${bgColor} border-2 ${borderColor} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center`}
        >
          <ArrowLeft size={24} className="text-white sm:w-7 sm:h-7" strokeWidth={3} />
        </button>
        {/* Right */}
        <button
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onTouchCancel={handleTouchCancel('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 ${bgColor} border-2 ${borderColor} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center`}
        >
          <ArrowRight size={24} className="text-white sm:w-7 sm:h-7" strokeWidth={3} />
        </button>
        {/* Center indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 bg-white border-2 border-black rounded-full" />
      </div>

      {/* Bomb Button (Right Side) - aligned with D-pad center */}
      <div className="pointer-events-auto flex items-center h-36 sm:h-40">
        <button
          onTouchStart={handleTouchStart('bomb')}
          onTouchEnd={handleTouchEnd('bomb')}
          onTouchCancel={handleTouchCancel('bomb')}
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full ${bgColor} border-[4px] sm:border-[5px] ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center relative`}
        >
          <span className="text-white font-black text-4xl sm:text-5xl">💣</span>
        </button>
      </div>
    </div>
  );
};

export default TouchControls;
