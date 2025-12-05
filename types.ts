
export enum TileType {
  EMPTY = 0,
  WALL_HARD = 1, // Indestructible
  WALL_SOFT = 2, // Destructible (Box)
}

export enum ItemType {
  NONE = 0,
  RANGE_UP = 1, // Increase explosion range
  BOMB_UP = 2,  // Increase max bombs
  SPEED_UP = 3, // Increase movement speed
  KICK = 4,     // Kick bombs
  GHOST = 5,    // Pass through soft walls and bombs
  SHIELD = 6,   // Block one damage
}

export enum PlayerState {
  NORMAL = 'NORMAL',
  TRAPPED = 'TRAPPED', // In a bubble
  DEAD = 'DEAD',
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE',
}

export enum GameMode {
  MENU = 'MENU',
  PVE = 'PVE', // Co-op vs AI
  PVP = 'PVP', // 1v1
}

export enum EnemyType {
  BALLOON = 'BALLOON', // Dumb, slow, random
  GHOST = 'GHOST',     // Faster, chases player
  MINION = 'MINION',   // Small, fast, weak
  FROG = 'FROG',       // Jumps over boxes
  TANK = 'TANK',       // Slow, 2 HP
  BOSS_SLIME = 'BOSS_SLIME', // Summons minions, fast dash
  BOSS_MECHA = 'BOSS_MECHA', // Places mega bombs, high HP
}

export enum SoundType {
  BOMB_PLACE = 'BOMB_PLACE',
  EXPLOSION = 'EXPLOSION',
  ITEM_GET = 'ITEM_GET',
  TRAPPED = 'TRAPPED',
  DIE = 'DIE',
  RESCUE = 'RESCUE',
  GAME_START = 'GAME_START',
  GAME_OVER = 'GAME_OVER',
  CLICK = 'CLICK',
  KICK = 'KICK',
  SHIELD_LOST = 'SHIELD_LOST',
  BOSS_SPAWN = 'BOSS_SPAWN',
  ENEMY_HIT = 'ENEMY_HIT',
  LEVEL_CLEAR = 'LEVEL_CLEAR',
}

export enum MusicTheme {
  MENU = 'MENU',
  PVE = 'PVE',
  PVP = 'PVP',
  BOSS = 'BOSS',
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Player {
  id: number;
  x: number; // Pixel coordinate
  y: number; // Pixel coordinate
  color: string;
  state: PlayerState;
  direction: Direction;
  
  // Stats
  score: number; // Kill count / Points
  speed: number;
  maxBombs: number;
  bombRange: number;
  activeBombs: number;
  
  // Abilities
  canKick: boolean;
  hasShield: boolean;
  ghostTimer: number; // MS remaining for ghost mode
  
  // State timers
  trappedTimer: number; // How long they have been trapped
  invincibleTimer: number; // Post-rescue invincibility
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  direction: Direction;
  speed: number;
  
  // Combat Stats
  hp: number;
  maxHp: number;
  
  // AI State
  changeDirTimer: number; // Time until next random direction change
  actionTimer: number;    // For boss skills or jumps
  invincibleTimer: number;// Post-hit frames
}

export interface Bomb {
  id: string; // unique id
  ownerId: number; // 0 for neutral/enemy
  gridX: number; // Grid coordinate
  gridY: number; // Grid coordinate
  
  // Physics for sliding (Kick)
  x: number; 
  y: number;
  vx: number;
  vy: number;
  
  range: number;
  timer: number; // Ticks until explosion
}

export interface Explosion {
  id: string;
  ownerId: number; // ID of the player who placed the bomb (0 for enemy/neutral)
  gridX: number;
  gridY: number;
  timer: number; // Duration of visual
}

export interface GameState {
  grid: TileType[][];
  items: { [key: string]: ItemType }; // key is "x,y"
  players: Player[];
  enemies: Enemy[];
  bombs: Bomb[];
  explosions: Explosion[];
  timeLeft: number;
  gameOver: boolean;
  winner: number | null; // 0 for tie/loss, 1 or 2 for player ID, 3 for PVE win
  bossSpawned: boolean;
  
  // Level Progression
  level: number;
  isLevelClear: boolean; // Replaces timer, pauses game for stats screen
}
