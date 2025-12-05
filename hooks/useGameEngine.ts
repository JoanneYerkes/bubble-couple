
import { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GameState, Player, PlayerState, TileType, Bomb, Explosion, 
  GameMode, ItemType, Direction, Enemy, EnemyType, SoundType, MusicTheme
} from '../types';
import { 
  GRID_W, GRID_H, TILE_SIZE, CONTROLS, BASE_SPEED, MAX_SPEED, PLAYER_SIZE,
  BOMB_TIMER_MS, EXPLOSION_DURATION_MS, TRAPPED_DURATION_MS, 
  INVINCIBLE_DURATION_MS, CORNER_TOLERANCE,
  GHOST_DURATION_MS, BOMB_SLIDE_SPEED, ENEMY_STATS, LEVEL_CONFIGS
} from '../constants';
import { createInitialGrid, isColliding, checkPlayerCollision, getGridCoords, getPixelCoords } from '../utils/gameUtils';
import { audioManager } from '../utils/audio';

export const useGameEngine = (mode: GameMode, onGameOver: (winner: number | null) => void) => {
  // We use Refs for the game state to avoid React render cycle overhead in the loop
  const gameStateRef = useRef<GameState>({
    grid: [],
    items: {},
    players: [],
    enemies: [],
    bombs: [],
    explosions: [],
    timeLeft: 180,
    gameOver: false,
    winner: null,
    bossSpawned: false,
    level: 1,
    isLevelClear: false,
  });

  const inputRef = useRef<Set<string>>(new Set());
  const [hudState, setHudState] = useState<GameState | null>(null); // For UI updates (lower frequency)
  const reqIdRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Handle BGM
  useEffect(() => {
    // Logic moved to startLevel/update for dynamic switching, 
    // but ensure music stops on unmount or menu return
    if (mode === GameMode.MENU) {
      audioManager.stopBGM();
    }
    return () => audioManager.stopBGM();
  }, [mode]);

  // Spawn a single enemy at valid location
  const spawnEnemy = (grid: TileType[][], existingEnemies: Enemy[], type: EnemyType, idPrefix: string): Enemy | null => {
      let attempts = 0;
      while (attempts < 100) {
          attempts++;
          const ex = Math.floor(Math.random() * GRID_W);
          const ey = Math.floor(Math.random() * GRID_H);
          
          if (grid[ey][ex] !== TileType.EMPTY) continue;
          if ((ex < 5 && ey < 5) || (ex > GRID_W - 5 && ey > GRID_H - 5)) continue;
          if (existingEnemies.some(e => Math.abs(e.x - ex * TILE_SIZE) < TILE_SIZE && Math.abs(e.y - ey * TILE_SIZE) < TILE_SIZE)) continue;

          const startPos = getPixelCoords(ex, ey);
          const stats = ENEMY_STATS[type];

          return {
              id: `${idPrefix}-${Date.now()}-${attempts}`,
              type,
              x: startPos.x,
              y: startPos.y,
              direction: Direction.DOWN,
              speed: stats.speed,
              hp: stats.hp,
              maxHp: stats.hp,
              changeDirTimer: 0,
              actionTimer: 2000,
              invincibleTimer: 0,
          };
      }
      return null;
  };

  const startLevel = useCallback((levelIndex: number) => {
    // Level Config (Indices 0 to 3 for levels 1 to 4)
    const config = LEVEL_CONFIGS[levelIndex - 1] || LEVEL_CONFIGS[0];

    const { grid, items } = createInitialGrid(config.wallDensity);
    
    // Player 1 Start (Top Left)
    const p1Start = getPixelCoords(1, 1);
    const p2Start = getPixelCoords(GRID_W - 2, GRID_H - 2);

    // Retrieve existing scores if progressing (preserve score, reset items)
    const existingP1 = gameStateRef.current.players.find(p => p.id === 1);
    const existingP2 = gameStateRef.current.players.find(p => p.id === 2);
    const p1Score = (levelIndex > 1 && existingP1) ? existingP1.score : 0;
    const p2Score = (levelIndex > 1 && existingP2) ? existingP2.score : 0;

    // Reset Players for each level but keep Score
    const players: Player[] = [
      {
        id: 1,
        x: p1Start.x,
        y: p1Start.y,
        color: '#3b82f6', // Blue
        state: PlayerState.NORMAL,
        direction: Direction.DOWN,
        speed: BASE_SPEED,
        maxBombs: 1,
        bombRange: 1,
        activeBombs: 0,
        score: p1Score,
        trappedTimer: 0,
        invincibleTimer: 0,
        canKick: false,
        hasShield: false,
        ghostTimer: 0,
      },
      {
        id: 2,
        x: p2Start.x,
        y: p2Start.y,
        color: '#ef4444', // Red
        state: PlayerState.NORMAL,
        direction: Direction.UP,
        speed: BASE_SPEED,
        maxBombs: 1,
        bombRange: 1,
        activeBombs: 0,
        score: p2Score,
        trappedTimer: 0,
        invincibleTimer: 0,
        canKick: false,
        hasShield: false,
        ghostTimer: 0,
      }
    ];

    // Spawn Enemies based on Level Config
    const enemies: Enemy[] = [];
    if (mode === GameMode.PVE) {
        config.enemies.forEach((type, idx) => {
             const e = spawnEnemy(grid, enemies, type, `init-${idx}`);
             if (e) enemies.push(e);
        });
    }

    gameStateRef.current = {
      grid,
      items,
      players,
      enemies,
      bombs: [],
      explosions: [],
      timeLeft: 180,
      gameOver: false,
      winner: null,
      bossSpawned: false,
      level: levelIndex,
      isLevelClear: false,
    };
    
    // Play Start Sound & Music
    if (levelIndex === 1) audioManager.play(SoundType.GAME_START);
    else audioManager.play(SoundType.RESCUE); // Generic start sound
    
    // Start correct music track
    if (mode === GameMode.PVP) {
        audioManager.playBGM(MusicTheme.PVP);
    } else {
        audioManager.playBGM(MusicTheme.PVE);
    }
  }, [mode]);

  // Initial Game Start
  const initGame = useCallback(() => {
      startLevel(1);
  }, [startLevel]);

  const proceedToNextLevel = useCallback(() => {
      const currentLevel = gameStateRef.current.level;
      startLevel(currentLevel + 1);
  }, [startLevel]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => inputRef.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => {
      inputRef.current.delete(e.code);
      handleBombInput(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleBombInput = (code: string) => {
    const state = gameStateRef.current;
    if (state.gameOver || state.isLevelClear) return;

    state.players.forEach(p => {
      if (p.state !== PlayerState.NORMAL) return;

      const isP1Bomb = p.id === 1 && code === CONTROLS.P1.BOMB;
      const isP2Bomb = p.id === 2 && (code === CONTROLS.P2.BOMB || code === 'Numpad0');

      if (isP1Bomb || isP2Bomb) {
        if (p.activeBombs < p.maxBombs) {
          const gridCoords = getGridCoords(p.x, p.y);
          const exists = state.bombs.some(b => b.gridX === gridCoords.x && b.gridY === gridCoords.y);
          if (!exists) {
            state.bombs.push({
              id: Math.random().toString(36),
              ownerId: p.id,
              gridX: gridCoords.x,
              gridY: gridCoords.y,
              x: gridCoords.x * TILE_SIZE,
              y: gridCoords.y * TILE_SIZE,
              vx: 0,
              vy: 0,
              range: p.bombRange,
              timer: BOMB_TIMER_MS,
            });
            p.activeBombs++;
            audioManager.play(SoundType.BOMB_PLACE);
          }
        }
      }
    });
  };

  const isEntityBlocked = (nx: number, ny: number, state: GameState, entityType: 'player' | 'enemy', player?: Player, enemy?: Enemy) => {
      const epsilon = 0.1;
      const corners = [
          {x: nx, y: ny},
          {x: nx + PLAYER_SIZE - epsilon, y: ny},
          {x: nx, y: ny + PLAYER_SIZE - epsilon},
          {x: nx + PLAYER_SIZE - epsilon, y: ny + PLAYER_SIZE - epsilon}
      ];
      for(const c of corners) {
          const gx = Math.floor(c.x / TILE_SIZE);
          const gy = Math.floor(c.y / TILE_SIZE);
          
          if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return true;
          
          const tile = state.grid[gy][gx];
          if (tile === TileType.WALL_HARD) return true;
          
          // GHOST / FROG LOGIC
          if (entityType === 'player' && player?.ghostTimer > 0) {
              // Pass
          } else if (entityType === 'enemy' && enemy?.type === EnemyType.FROG) {
              // Frog sees wall as block, handled in AI
              if (tile === TileType.WALL_SOFT) return true;
          } else {
              if (tile === TileType.WALL_SOFT) return true;
          }
          
          const bomb = state.bombs.find(b => b.gridX === gx && b.gridY === gy);
          if (bomb) {
              if (entityType === 'player' && player?.ghostTimer > 0) {
                  // Pass
              } else if (entityType === 'player') {
                  if (!isColliding(player.x, player.y, gx, gy)) return true;
              } else {
                  return true;
              }
          }
      }
      return false;
  };

  const update = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    const state = gameStateRef.current;
    if (state.gameOver) return;
    
    // Level Clear State - Pause Game Logic, Wait for UI Input
    if (state.isLevelClear) {
         setHudState({ ...state });
         reqIdRef.current = requestAnimationFrame(update);
         return;
    }

    // --- 1. Player Movement ---
    state.players.forEach(p => {
      if (p.state !== PlayerState.NORMAL) return;
      if (p.ghostTimer > 0) p.ghostTimer -= dt;

      let dx = 0;
      let dy = 0;
      const speed = p.speed;

      if (p.id === 1) {
        if (inputRef.current.has(CONTROLS.P1.UP)) dy = -speed;
        if (inputRef.current.has(CONTROLS.P1.DOWN)) dy = speed;
        if (inputRef.current.has(CONTROLS.P1.LEFT)) dx = -speed;
        if (inputRef.current.has(CONTROLS.P1.RIGHT)) dx = speed;
      }
      else if (p.id === 2) {
        if (inputRef.current.has(CONTROLS.P2.UP)) dy = -speed;
        if (inputRef.current.has(CONTROLS.P2.DOWN)) dy = speed;
        if (inputRef.current.has(CONTROLS.P2.LEFT)) dx = -speed;
        if (inputRef.current.has(CONTROLS.P2.RIGHT)) dx = speed;
      }

      if (dx !== 0 || dy !== 0) {
        const checkMove = (nx: number, ny: number, moveDir: {x: number, y: number}): boolean => {
            const epsilon = 0.1;
            const corners = [
               {x: nx, y: ny},
               {x: nx + PLAYER_SIZE - epsilon, y: ny},
               {x: nx, y: ny + PLAYER_SIZE - epsilon},
               {x: nx + PLAYER_SIZE - epsilon, y: ny + PLAYER_SIZE - epsilon}
            ];
            
            for(const c of corners) {
               const gx = Math.floor(c.x / TILE_SIZE);
               const gy = Math.floor(c.y / TILE_SIZE);
               if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return true;
               
               const tile = state.grid[gy][gx];
               if (tile === TileType.WALL_HARD) return true;
               if (tile === TileType.WALL_SOFT && p.ghostTimer <= 0) return true;
               
               const bomb = state.bombs.find(b => b.gridX === gx && b.gridY === gy);
               if (bomb && p.ghostTimer <= 0) {
                   if (isColliding(p.x, p.y, gx, gy)) {
                       // Overlap allowed
                   } else {
                       if (p.canKick && bomb.vx === 0 && bomb.vy === 0) {
                           if (moveDir.x !== 0) bomb.vx = Math.sign(moveDir.x) * BOMB_SLIDE_SPEED;
                           if (moveDir.y !== 0) bomb.vy = Math.sign(moveDir.y) * BOMB_SLIDE_SPEED;
                           audioManager.play(SoundType.KICK);
                       }
                       return true;
                   }
               }
            }
            return false;
        };

        if (dx !== 0) {
            if (!checkMove(p.x + dx, p.y, {x: dx, y: 0})) {
                p.x += dx;
            } else {
                const centerY = p.y + PLAYER_SIZE / 2;
                const tileY = Math.floor(centerY / TILE_SIZE);
                const tileCenterY = tileY * TILE_SIZE + TILE_SIZE / 2;
                const diff = centerY - tileCenterY;
                if (Math.abs(diff) <= CORNER_TOLERANCE && Math.abs(diff) > 0) {
                    const dir = diff > 0 ? -1 : 1;
                    const correction = dir * speed;
                    if (!checkMove(p.x, p.y + correction, {x: 0, y: correction})) p.y += correction;
                }
            }
        }
        if (dy !== 0) {
            if (!checkMove(p.x, p.y + dy, {x: 0, y: dy})) {
                p.y += dy;
            } else {
                const centerX = p.x + PLAYER_SIZE / 2;
                const tileX = Math.floor(centerX / TILE_SIZE);
                const tileCenterX = tileX * TILE_SIZE + TILE_SIZE / 2;
                const diff = centerX - tileCenterX;
                if (Math.abs(diff) <= CORNER_TOLERANCE && Math.abs(diff) > 0) {
                    const dir = diff > 0 ? -1 : 1;
                    const correction = dir * speed;
                    if (!checkMove(p.x + correction, p.y, {x: correction, y: 0})) p.x += correction;
                }
            }
        }
      }
      
      if (dy < 0) p.direction = Direction.UP;
      else if (dy > 0) p.direction = Direction.DOWN;
      else if (dx < 0) p.direction = Direction.LEFT;
      else if (dx > 0) p.direction = Direction.RIGHT;
      
      const center = getGridCoords(p.x, p.y);
      const key = `${center.x},${center.y}`;
      if (state.items[key]) {
        const item = state.items[key];
        if (item === ItemType.RANGE_UP) p.bombRange = Math.min(p.bombRange + 1, 8);
        if (item === ItemType.BOMB_UP) p.maxBombs = Math.min(p.maxBombs + 1, 8);
        if (item === ItemType.SPEED_UP) p.speed = Math.min(p.speed + 1, MAX_SPEED);
        if (item === ItemType.KICK) p.canKick = true;
        if (item === ItemType.GHOST) p.ghostTimer = GHOST_DURATION_MS;
        if (item === ItemType.SHIELD) p.hasShield = true;
        
        audioManager.play(SoundType.ITEM_GET);
        delete state.items[key];
      }
    });

    // --- 2. Enemy AI & Boss Logic ---
    if (mode === GameMode.PVE) {
        const config = LEVEL_CONFIGS[state.level - 1] || LEVEL_CONFIGS[0];

        // Spawn Boss if wave cleared
        if (state.enemies.length === 0 && !state.bossSpawned && config.boss) {
             state.bossSpawned = true;
             const boss = spawnEnemy(state.grid, state.enemies, config.boss, 'boss');
             if (boss) {
                 state.enemies.push(boss);
                 audioManager.play(SoundType.BOSS_SPAWN);
                 // Switch to BOSS Music
                 audioManager.playBGM(MusicTheme.BOSS);
             }
        }

        state.enemies.forEach(enemy => {
            if (enemy.invincibleTimer > 0) enemy.invincibleTimer -= dt;

            let dx = 0;
            let dy = 0;
            let moved = false;
            enemy.changeDirTimer -= dt;
            enemy.actionTimer -= dt;

            // Target nearest player
            let targetP: Player | null = null;
            let minDist = Infinity;
            state.players.forEach(p => {
                if (p.state !== PlayerState.DEAD) {
                    const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
                    if (dist < minDist) {
                        minDist = dist;
                        targetP = p;
                    }
                }
            });

            // --- BOSS SKILLS ---
            if (enemy.actionTimer <= 0) {
                if (enemy.type === EnemyType.BOSS_SLIME) {
                    // Skill: Spawn Minion
                    if (state.enemies.length < 8) {
                        const minion = spawnEnemy(state.grid, state.enemies, EnemyType.MINION, 'minion');
                        if (minion) {
                            minion.x = enemy.x; // Spawn at boss location
                            minion.y = enemy.y;
                            state.enemies.push(minion);
                        }
                    }
                    enemy.actionTimer = 4000;
                } 
                else if (enemy.type === EnemyType.BOSS_MECHA) {
                    // Skill: Mega Bomb
                    const gx = Math.floor((enemy.x + PLAYER_SIZE/2)/TILE_SIZE);
                    const gy = Math.floor((enemy.y + PLAYER_SIZE/2)/TILE_SIZE);
                    const exists = state.bombs.some(b => b.gridX === gx && b.gridY === gy);
                    if (!exists) {
                        state.bombs.push({
                            id: `megabomb-${Date.now()}`,
                            ownerId: 0, // 0 = Enemy
                            gridX: gx,
                            gridY: gy,
                            x: gx * TILE_SIZE,
                            y: gy * TILE_SIZE,
                            vx: 0,
                            vy: 0,
                            range: 5,
                            timer: 4000
                        });
                        audioManager.play(SoundType.BOMB_PLACE);
                    }
                    enemy.actionTimer = 5000;
                }
            }

            // --- MOVEMENT AI ---
            const shouldChase = [EnemyType.GHOST, EnemyType.TANK, EnemyType.MINION, EnemyType.BOSS_SLIME, EnemyType.BOSS_MECHA].includes(enemy.type);
            
            if (shouldChase && targetP && enemy.changeDirTimer <= 0) {
                 const diffX = targetP.x - enemy.x;
                 const diffY = targetP.y - enemy.y;
                 if (Math.abs(diffX) > Math.abs(diffY)) {
                     enemy.direction = diffX > 0 ? Direction.RIGHT : Direction.LEFT;
                 } else {
                     enemy.direction = diffY > 0 ? Direction.DOWN : Direction.UP;
                 }
                 enemy.changeDirTimer = 500; // Recalculate path frequently
            } 
            else if (enemy.changeDirTimer <= 0) {
                const dirs = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
                enemy.direction = dirs[Math.floor(Math.random() * dirs.length)];
                enemy.changeDirTimer = 2000 + Math.random() * 2000;
            }

            switch (enemy.direction) {
                case Direction.UP: dy = -enemy.speed; break;
                case Direction.DOWN: dy = enemy.speed; break;
                case Direction.LEFT: dx = -enemy.speed; break;
                case Direction.RIGHT: dx = enemy.speed; break;
            }

            // Collision Check
            let nextX = enemy.x + dx;
            let nextY = enemy.y + dy;
            
            // FROG JUMP LOGIC
            if (enemy.type === EnemyType.FROG) {
                 if (isEntityBlocked(nextX, nextY, state, 'enemy', undefined, enemy)) {
                     const gx = Math.floor((enemy.x + PLAYER_SIZE/2)/TILE_SIZE);
                     const gy = Math.floor((enemy.y + PLAYER_SIZE/2)/TILE_SIZE);
                     
                     let jumpX = 0; let jumpY = 0;
                     if (enemy.direction === Direction.UP) jumpY = -2;
                     if (enemy.direction === Direction.DOWN) jumpY = 2;
                     if (enemy.direction === Direction.LEFT) jumpX = -2;
                     if (enemy.direction === Direction.RIGHT) jumpX = 2;

                     const jgx = gx + jumpX; 
                     const jgy = gy + jumpY;
                     
                     if (jgx >= 0 && jgx < GRID_W && jgy >= 0 && jgy < GRID_H && state.grid[jgy][jgx] === TileType.EMPTY) {
                         const blockingTileX = gx + jumpX/2;
                         const blockingTileY = gy + jumpY/2;
                         if (state.grid[blockingTileY][blockingTileX] === TileType.WALL_SOFT) {
                             enemy.x = jgx * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE)/2;
                             enemy.y = jgy * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE)/2;
                             moved = true;
                             enemy.changeDirTimer = 1000; 
                         }
                     }
                 }
            }

            if (!moved) {
                if (!isEntityBlocked(nextX, nextY, state, 'enemy', undefined, enemy)) {
                    enemy.x = nextX;
                    enemy.y = nextY;
                } else {
                    enemy.changeDirTimer = 0; // Hit wall, change dir
                }
            }
        });
    }

    // --- 3. Bombs & Explosions ---
    state.bombs.forEach(b => {
        if (b.vx !== 0 || b.vy !== 0) {
            const nextX = b.x + b.vx;
            const nextY = b.y + b.vy;
            const centerX = nextX + TILE_SIZE / 2;
            const centerY = nextY + TILE_SIZE / 2;
            const gx = Math.floor(centerX / TILE_SIZE);
            const gy = Math.floor(centerY / TILE_SIZE);

            let blocked = false;
            
            if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) blocked = true;
            else if (state.grid[gy][gx] !== TileType.EMPTY) blocked = true;
            else {
                const otherBomb = state.bombs.find(ob => ob !== b && ob.gridX === gx && ob.gridY === gy);
                if (otherBomb) blocked = true;
                const hitPlayer = state.players.some(p => isColliding(p.x, p.y, gx, gy));
                if (hitPlayer) blocked = true;
            }

            if (blocked) {
                b.vx = 0; b.vy = 0;
                b.x = b.gridX * TILE_SIZE;
                b.y = b.gridY * TILE_SIZE;
            } else {
                b.x = nextX; b.y = nextY;
                b.gridX = gx; b.gridY = gy;
            }
        }
        b.timer -= dt;
    });

    const explodedBombs = state.bombs.filter(b => b.timer <= 0);
    state.bombs = state.bombs.filter(b => b.timer > 0);

    const newExplosions: Explosion[] = [];
    const triggerExplosion = (bomb: Bomb) => {
       if (bomb.ownerId > 0) {
           const owner = state.players.find(p => p.id === bomb.ownerId);
           if (owner) owner.activeBombs = Math.max(0, owner.activeBombs - 1);
       }

       newExplosions.push({ 
           id: Math.random().toString(), 
           ownerId: bomb.ownerId, 
           gridX: bomb.gridX, 
           gridY: bomb.gridY, 
           timer: EXPLOSION_DURATION_MS 
       });

       const directions = [{dx:0, dy:-1}, {dx:0, dy:1}, {dx:-1, dy:0}, {dx:1, dy:0}];
       directions.forEach(dir => {
         for(let i = 1; i <= bomb.range; i++) {
           const tx = bomb.gridX + (dir.dx * i);
           const ty = bomb.gridY + (dir.dy * i);
           
           if (tx < 0 || tx >= GRID_W || ty < 0 || ty >= GRID_H) break;
           if (state.grid[ty][tx] === TileType.WALL_HARD) break;

           if (state.grid[ty][tx] === TileType.WALL_SOFT) {
             state.grid[ty][tx] = TileType.EMPTY; 
             newExplosions.push({ id: Math.random().toString(), ownerId: bomb.ownerId, gridX: tx, gridY: ty, timer: EXPLOSION_DURATION_MS });
             break; 
           }

           const hitBombIndex = state.bombs.findIndex(b => b.gridX === tx && b.gridY === ty);
           if (hitBombIndex !== -1) {
             const hitBomb = state.bombs[hitBombIndex];
             state.bombs.splice(hitBombIndex, 1);
             triggerExplosion(hitBomb);
           }
           newExplosions.push({ id: Math.random().toString(), ownerId: bomb.ownerId, gridX: tx, gridY: ty, timer: EXPLOSION_DURATION_MS });
         }
       });
    };

    explodedBombs.forEach(triggerExplosion);
    if (newExplosions.length > 0) audioManager.play(SoundType.EXPLOSION);
    state.explosions.push(...newExplosions);

    state.explosions = state.explosions.filter(e => {
      e.timer -= dt;
      return e.timer > 0;
    });

    // --- 4. Interactions ---
    const handleDamage = (p: Player) => {
        if (p.hasShield) {
            p.hasShield = false;
            p.invincibleTimer = 1000;
            audioManager.play(SoundType.SHIELD_LOST);
            return;
        }
        if (p.state === PlayerState.NORMAL) {
          p.state = PlayerState.TRAPPED;
          p.trappedTimer = TRAPPED_DURATION_MS;
          p.invincibleTimer = 1000;
          audioManager.play(SoundType.TRAPPED);
        } else if (p.state === PlayerState.TRAPPED && p.invincibleTimer <= 0) {
          p.state = PlayerState.DEAD;
          audioManager.play(SoundType.DIE);
        }
    };

    state.players.forEach(p => {
      if (p.invincibleTimer > 0) {
        p.invincibleTimer -= dt;
        return;
      }
      if (p.state === PlayerState.DEAD) return;

      const pGrid = getGridCoords(p.x, p.y);
      if (state.explosions.some(e => e.gridX === pGrid.x && e.gridY === pGrid.y)) {
        handleDamage(p);
      }
      if (p.state === PlayerState.TRAPPED) {
        p.trappedTimer -= dt;
        if (p.trappedTimer <= 0) {
            p.state = PlayerState.DEAD;
            audioManager.play(SoundType.DIE);
        }
      }
    });

    // Enemy Damage (Explosion)
    if (mode === GameMode.PVE) {
        const survivingEnemies: Enemy[] = [];
        state.enemies.forEach(enemy => {
            if (enemy.invincibleTimer > 0) {
                survivingEnemies.push(enemy);
                return;
            }
            
            const eGrid = getGridCoords(enemy.x, enemy.y);
            const explosion = state.explosions.find(e => e.gridX === eGrid.x && e.gridY === eGrid.y);
            
            if (explosion) {
                enemy.hp -= 1;
                enemy.invincibleTimer = 500;
                
                // Track Score
                if (explosion.ownerId > 0 && enemy.hp <= 0) {
                    const killer = state.players.find(p => p.id === explosion.ownerId);
                    if (killer) killer.score += 1; // Increment kill count
                }

                if (enemy.hp <= 0) {
                    audioManager.play(SoundType.DIE);
                } else {
                    audioManager.play(SoundType.ENEMY_HIT); 
                    survivingEnemies.push(enemy);
                }
            } else {
                survivingEnemies.push(enemy);
            }
        });
        state.enemies = survivingEnemies;
    }

    // Player vs Enemy Collision
    if (mode === GameMode.PVE) {
        state.players.forEach(p => {
            if (p.state === PlayerState.DEAD || p.invincibleTimer > 0) return;
            const hitEnemy = state.enemies.some(e => checkPlayerCollision(p, e));
            if (hitEnemy) handleDamage(p);
        });
    }

    // Player vs Player
    if (checkPlayerCollision(state.players[0], state.players[1])) {
       const p1 = state.players[0];
       const p2 = state.players[1];
       if (p1.state === PlayerState.NORMAL && p2.state === PlayerState.TRAPPED) {
         p2.state = PlayerState.NORMAL; p2.invincibleTimer = INVINCIBLE_DURATION_MS; audioManager.play(SoundType.RESCUE);
       }
       else if (p2.state === PlayerState.NORMAL && p1.state === PlayerState.TRAPPED) {
         p1.state = PlayerState.NORMAL; p1.invincibleTimer = INVINCIBLE_DURATION_MS; audioManager.play(SoundType.RESCUE);
       }
    }

    // --- 5. Game Over / Level Clear Logic ---
    const activePlayers = state.players.filter(p => p.state !== PlayerState.DEAD);
    const trappedPlayers = state.players.filter(p => p.state === PlayerState.TRAPPED);

    if (mode === GameMode.PVE) {
        const config = LEVEL_CONFIGS[state.level - 1] || LEVEL_CONFIGS[0];
        // Condition: Enemies cleared AND (No boss expected OR Boss was spawned and killed)
        const allEnemiesDead = state.enemies.length === 0;
        const bossConditionMet = !config.boss || state.bossSpawned;

        if (allEnemiesDead && bossConditionMet && !state.gameOver) {
            if (state.level >= LEVEL_CONFIGS.length) {
                state.gameOver = true;
                state.winner = 12; // PVE Win Code
            } else if (!state.isLevelClear) {
                // Trigger Level Clear Screen
                state.isLevelClear = true;
                audioManager.play(SoundType.LEVEL_CLEAR);
                audioManager.stopBGM(); // Stop battle music during stats
            }
        } 
        else if (activePlayers.length === 0) {
             state.gameOver = true;
             state.winner = 0; 
        }
    } 
    else if (mode === GameMode.PVP) {
        if (activePlayers.length === 0) {
            state.gameOver = true;
            state.winner = 0;
        } else if (activePlayers.length === 1 && trappedPlayers.length === 0) {
            state.gameOver = true;
            state.winner = activePlayers[0].id;
        }
    }

    if (state.gameOver) {
      onGameOver(state.winner);
      audioManager.stopBGM();
      audioManager.play(SoundType.GAME_OVER);
    }
    
    setHudState({ ...state });
    reqIdRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    initGame();
    reqIdRef.current = requestAnimationFrame(update);
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [mode, initGame]);

  return { gameStateRef, hudState, initGame, proceedToNextLevel };
};
