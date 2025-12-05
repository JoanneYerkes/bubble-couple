
import { EnemyType } from "./types";

// Grid Configuration
export const GRID_W = 15;
export const GRID_H = 13;
export const TILE_SIZE = 48; // Pixels per tile
export const HEADER_HEIGHT = 64; // Height of the HUD bar

// Timing (assuming 60 FPS loop)
export const BOMB_TIMER_MS = 3000;
export const EXPLOSION_DURATION_MS = 600;
export const TRAPPED_DURATION_MS = 5000;
export const INVINCIBLE_DURATION_MS = 2000;
export const GHOST_DURATION_MS = 10000;
export const GAME_DURATION_SEC = 180;

// Physics
export const BASE_SPEED = 3;
export const MAX_SPEED = 6;
export const BOMB_SLIDE_SPEED = 6;
export const CORNER_TOLERANCE = 12; // Pixels to allow corner sliding
export const PLAYER_SIZE = 36; // Slightly smaller than tile for movement
export const PLAYER_OFFSET = (TILE_SIZE - PLAYER_SIZE) / 2;

// Enemy Config
export const ENEMY_SPEED_SLOW = 1.5;
export const ENEMY_SPEED_FAST = 2.5;

export const ENEMY_STATS = {
    BALLOON: { speed: 1.5, hp: 1 },
    GHOST:   { speed: 2.2, hp: 1 },
    MINION:  { speed: 2.0, hp: 1 },
    FROG:    { speed: 2.0, hp: 1 },
    TANK:    { speed: 1.0, hp: 2 },
    BOSS_SLIME: { speed: 2.8, hp: 4 },
    BOSS_MECHA: { speed: 1.8, hp: 6 },
};

export interface LevelConfig {
  level: number;
  wallDensity: number;
  enemies: EnemyType[];
  boss: EnemyType | null;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    wallDensity: 0.6,
    enemies: [EnemyType.BALLOON, EnemyType.BALLOON, EnemyType.BALLOON, EnemyType.MINION, EnemyType.MINION],
    boss: null
  },
  {
    level: 2,
    wallDensity: 0.55,
    enemies: [EnemyType.MINION, EnemyType.MINION, EnemyType.FROG, EnemyType.FROG, EnemyType.TANK, EnemyType.GHOST],
    boss: null
  },
  {
    level: 3,
    wallDensity: 0.5,
    enemies: [EnemyType.TANK, EnemyType.TANK, EnemyType.MINION, EnemyType.MINION, EnemyType.GHOST],
    boss: EnemyType.BOSS_SLIME
  },
  {
    level: 4,
    wallDensity: 0.45,
    enemies: [EnemyType.FROG, EnemyType.FROG, EnemyType.GHOST, EnemyType.GHOST, EnemyType.TANK],
    boss: EnemyType.BOSS_MECHA
  }
];

// Input Keys
export const CONTROLS = {
  P1: {
    UP: 'KeyW',
    DOWN: 'KeyS',
    LEFT: 'KeyA',
    RIGHT: 'KeyD',
    BOMB: 'Space',
  },
  P2: {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    BOMB: 'Enter', // Or Numpad0
  }
};
