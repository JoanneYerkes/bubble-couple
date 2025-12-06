import { useEffect, useRef } from 'react';

export interface GamepadState {
  connected: boolean;
  buttons: boolean[];
  axes: number[];
}

export interface GamepadInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  bomb: boolean;
}

const AXIS_THRESHOLD = 0.5;
const BUTTON_A = 0; // Xbox A button (Cross on PlayStation)
const BUTTON_B = 1; // Xbox B button (Circle on PlayStation)

/**
 * Custom hook to handle gamepad input for a specific player
 * @param gamepadIndex - Index of the gamepad (0 for P1, 1 for P2)
 * @returns GamepadInput object with current button states
 */
export const useGamepad = (gamepadIndex: number): GamepadInput => {
  const inputRef = useRef<GamepadInput>({
    up: false,
    down: false,
    left: false,
    right: false,
    bomb: false,
  });

  useEffect(() => {
    let animationFrameId: number;
    let lastBombButtonState = false;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[gamepadIndex];

      if (gamepad && gamepad.connected) {
        // D-pad or Left Analog Stick for movement
        // Axes: [0] = Left stick X, [1] = Left stick Y
        const leftStickX = gamepad.axes[0] || 0;
        const leftStickY = gamepad.axes[1] || 0;

        // D-pad buttons: [12] = Up, [13] = Down, [14] = Left, [15] = Right
        const dpadUp = gamepad.buttons[12]?.pressed || false;
        const dpadDown = gamepad.buttons[13]?.pressed || false;
        const dpadLeft = gamepad.buttons[14]?.pressed || false;
        const dpadRight = gamepad.buttons[15]?.pressed || false;

        // Combine D-pad and analog stick input
        inputRef.current.up = dpadUp || leftStickY < -AXIS_THRESHOLD;
        inputRef.current.down = dpadDown || leftStickY > AXIS_THRESHOLD;
        inputRef.current.left = dpadLeft || leftStickX < -AXIS_THRESHOLD;
        inputRef.current.right = dpadRight || leftStickX > AXIS_THRESHOLD;

        // A or B button for bomb (detecting press, not hold)
        const bombButton = gamepad.buttons[BUTTON_A]?.pressed || gamepad.buttons[BUTTON_B]?.pressed || false;
        
        // Detect button press edge (transition from not pressed to pressed)
        if (bombButton && !lastBombButtonState) {
          inputRef.current.bomb = true;
        } else if (!bombButton) {
          inputRef.current.bomb = false;
        }
        lastBombButtonState = bombButton;

      } else {
        // Reset input if gamepad disconnected
        inputRef.current = {
          up: false,
          down: false,
          left: false,
          right: false,
          bomb: false,
        };
      }

      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    // Start polling
    animationFrameId = requestAnimationFrame(pollGamepad);

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gamepadIndex]);

  return inputRef.current;
};

/**
 * Check if a gamepad is connected at the specified index
 */
export const isGamepadConnected = (gamepadIndex: number): boolean => {
  const gamepads = navigator.getGamepads();
  const gamepad = gamepads[gamepadIndex];
  return gamepad !== null && gamepad.connected;
};
