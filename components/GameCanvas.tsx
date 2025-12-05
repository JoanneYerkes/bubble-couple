
import React, { useRef, useEffect } from 'react';
import { GameState, TileType, PlayerState, ItemType, EnemyType, Direction } from '../types';
import { TILE_SIZE, GRID_W, GRID_H, PLAYER_SIZE, PLAYER_OFFSET } from '../constants';

interface GameCanvasProps {
  gameStateRef: React.MutableRefObject<GameState>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameStateRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Grid / Floor - Optimized for Eye Comfort (Soft Stone Theme)
    ctx.fillStyle = '#F5F5F4'; // Stone-100 (Warm Light Gray) - softer than pure white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid Lines (Subtle)
    ctx.strokeStyle = '#D6D3D1'; // Stone-300
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= GRID_W; x++) {
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, GRID_H * TILE_SIZE);
    }
    for (let y = 0; y <= GRID_H; y++) {
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(GRID_W * TILE_SIZE, y * TILE_SIZE);
    }
    ctx.stroke();


    // 2. Draw Walls & Items
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const tile = state.grid[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Checkerboard Pattern for visual path clarity
        if ((x + y) % 2 === 0) {
           ctx.fillStyle = '#E7E5E4'; // Stone-200 (Distinct but soft contrast)
           ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        const key = `${x},${y}`;
        // Draw Items (visible if no wall)
        if (state.items[key] && tile === TileType.EMPTY) {
            const type = state.items[key];
            let color = '#fff';
            let icon = '';
            
            if (type === ItemType.BOMB_UP) { color = '#1f2937'; icon = '💣'; } // Dark gray
            else if (type === ItemType.RANGE_UP) { color = '#facc15'; icon = '⚡'; } // Yellow
            else if (type === ItemType.SPEED_UP) { color = '#3b82f6'; icon = '👟'; } // Blue
            else if (type === ItemType.KICK) { color = '#ec4899'; icon = '🦶'; } // Pink
            else if (type === ItemType.GHOST) { color = '#a855f7'; icon = '👻'; } // Purple
            else if (type === ItemType.SHIELD) { color = '#10b981'; icon = '🛡️'; } // Green

            // Item Circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, px + TILE_SIZE/2, py + TILE_SIZE/2);
        }

        if (tile === TileType.WALL_HARD) {
          // Hard Wall: Dark, Brutalist Block
          ctx.fillStyle = '#374151'; // Dark Slate
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          
          // "X" pattern or simple border
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
          
          // Cross hatch
          ctx.beginPath();
          ctx.moveTo(px, py); ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE);
          ctx.stroke();

        } else if (tile === TileType.WALL_SOFT) {
          // Soft Wall: Orange Box, Black Border
          ctx.fillStyle = '#FB923C'; // Orange-400
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
          
          // Inner detail
          ctx.fillStyle = '#FDBA74'; // Orange-300
          ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
          ctx.strokeRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        }
      }
    }

    // 3. Draw Bombs
    state.bombs.forEach(b => {
       const px = b.x;
       const py = b.y;
       const scale = 1 + Math.sin(Date.now() / 100) * 0.05;
       const centerX = px + TILE_SIZE/2;
       const centerY = py + TILE_SIZE/2;
       const radius = (TILE_SIZE/2 - 6) * scale;

       // Shadow
       ctx.fillStyle = 'rgba(0,0,0,0.2)';
       ctx.beginPath();
       ctx.ellipse(centerX + 4, centerY + 4, radius, radius * 0.8, 0, 0, Math.PI*2);
       ctx.fill();

       // Main Body (Black)
       ctx.fillStyle = '#000000'; 
       ctx.beginPath();
       ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
       ctx.fill();

       // Shine (White, Sharp)
       ctx.fillStyle = '#ffffff';
       ctx.beginPath();
       ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.25, 0, Math.PI*2);
       ctx.fill();

       // Fuse
       ctx.strokeStyle = '#f59e0b';
       ctx.lineWidth = 3;
       ctx.beginPath();
       ctx.moveTo(centerX, centerY - radius);
       ctx.lineTo(centerX + 6, centerY - radius - 10);
       ctx.stroke();

       // Spark
       const sparkColor = Math.floor(Date.now() / 50) % 2 === 0 ? '#ef4444' : '#fbbf24';
       ctx.fillStyle = sparkColor;
       ctx.beginPath();
       ctx.arc(centerX + 6, centerY - radius - 10, 4, 0, Math.PI*2);
       ctx.fill();
    });

    // 4. Draw Explosions
    state.explosions.forEach(e => {
        const px = e.gridX * TILE_SIZE;
        const py = e.gridY * TILE_SIZE;
        
        // Solid colors for brutalist feel
        ctx.fillStyle = '#ef4444'; // Red-500
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        
        // Inner yellow square
        ctx.fillStyle = '#fcd34d'; // Yellow-300
        const inset = 8;
        ctx.fillRect(px + inset, py + inset, TILE_SIZE - inset*2, TILE_SIZE - inset*2);
        
        // Black border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
    });

    // 5. Draw Enemies
    state.enemies.forEach(e => {
         const cx = e.x + PLAYER_SIZE/2;
         const cy = e.y + PLAYER_SIZE/2;
         const bob = Math.sin(Date.now() / 150) * 2;
         
         if (e.invincibleTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
             ctx.globalAlpha = 0.5;
         }

         // Draw Shadow
         ctx.fillStyle = 'rgba(0,0,0,0.2)';
         ctx.beginPath();
         ctx.ellipse(cx, cy + PLAYER_SIZE/2 - 2, PLAYER_SIZE/2, PLAYER_SIZE/4, 0, 0, Math.PI*2);
         ctx.fill();

         // Draw Stroke for all enemies (Brutalist outline)
         ctx.lineWidth = 2;
         ctx.strokeStyle = '#000';

         if (e.type === EnemyType.BALLOON) {
             ctx.fillStyle = '#fb923c'; // Orange
             ctx.beginPath();
             ctx.arc(cx, cy + bob, PLAYER_SIZE/2 - 2, 0, Math.PI * 2);
             ctx.fill();
             ctx.stroke();
             // Face
             ctx.fillStyle = '#fff';
             ctx.beginPath(); ctx.arc(cx-6, cy-4+bob, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
             ctx.beginPath(); ctx.arc(cx+6, cy-4+bob, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
             ctx.fillStyle = '#000';
             ctx.beginPath(); ctx.arc(cx-6, cy-4+bob, 1.5, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(cx+6, cy-4+bob, 1.5, 0, Math.PI*2); ctx.fill();
         } 
         else if (e.type === EnemyType.GHOST) {
             ctx.fillStyle = '#c084fc'; // Purple
             ctx.beginPath();
             ctx.arc(cx, cy - 4 + bob, PLAYER_SIZE/2 - 2, Math.PI, 0);
             ctx.lineTo(cx + PLAYER_SIZE/2 - 2, cy + PLAYER_SIZE/2);
             ctx.lineTo(cx, cy + PLAYER_SIZE/2 - 4);
             ctx.lineTo(cx - PLAYER_SIZE/2 + 2, cy + PLAYER_SIZE/2);
             ctx.closePath();
             ctx.fill();
             ctx.stroke();
             // Eyes
             ctx.fillStyle = '#fff';
             ctx.beginPath(); ctx.arc(cx-6, cy-4+bob, 3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
             ctx.beginPath(); ctx.arc(cx+6, cy-4+bob, 3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
         }
         else if (e.type === EnemyType.MINION) {
             ctx.fillStyle = '#fde047'; // Yellow
             ctx.beginPath();
             ctx.arc(cx, cy + bob, PLAYER_SIZE/2 - 6, 0, Math.PI * 2);
             ctx.fill();
             ctx.stroke();
             // Cyclops Eye
             ctx.fillStyle = '#fff';
             ctx.beginPath(); ctx.arc(cx, cy-4+bob, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
             ctx.fillStyle = '#000';
             ctx.beginPath(); ctx.arc(cx, cy-4+bob, 3, 0, Math.PI*2); ctx.fill();
         }
         else if (e.type === EnemyType.FROG) {
             ctx.fillStyle = '#4ade80'; // Green
             ctx.beginPath();
             ctx.ellipse(cx, cy + bob, PLAYER_SIZE/2, PLAYER_SIZE/3, 0, 0, Math.PI*2);
             ctx.fill();
             ctx.stroke();
             ctx.beginPath(); ctx.arc(cx-8, cy-12+bob, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
             ctx.beginPath(); ctx.arc(cx+8, cy-12+bob, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
         }
         else if (e.type === EnemyType.TANK) {
             ctx.fillStyle = '#94a3b8'; // Slate
             ctx.fillRect(cx - PLAYER_SIZE/2, cy - PLAYER_SIZE/2 + bob, PLAYER_SIZE, PLAYER_SIZE);
             ctx.strokeRect(cx - PLAYER_SIZE/2, cy - PLAYER_SIZE/2 + bob, PLAYER_SIZE, PLAYER_SIZE);
             // Treads
             ctx.fillStyle = '#000';
             ctx.fillRect(cx - PLAYER_SIZE/2 - 4, cy - PLAYER_SIZE/2 + bob, 6, PLAYER_SIZE);
             ctx.fillRect(cx + PLAYER_SIZE/2 - 2, cy - PLAYER_SIZE/2 + bob, 6, PLAYER_SIZE);
         }
         else if (e.type === EnemyType.BOSS_SLIME) {
             const sz = PLAYER_SIZE * 1.5;
             ctx.fillStyle = '#bef264'; // Lime
             ctx.beginPath();
             ctx.arc(cx, cy + bob, sz/2, 0, Math.PI * 2);
             ctx.fill();
             ctx.stroke();
             // Crown
             ctx.fillStyle = '#fcd34d';
             ctx.beginPath();
             ctx.moveTo(cx-12, cy-sz/2+bob); ctx.lineTo(cx-6, cy-sz/2-14+bob); ctx.lineTo(cx, cy-sz/2+bob); ctx.lineTo(cx+6, cy-sz/2-14+bob); ctx.lineTo(cx+12, cy-sz/2+bob);
             ctx.fill(); ctx.stroke();
         }
         else if (e.type === EnemyType.BOSS_MECHA) {
             const sz = PLAYER_SIZE * 1.5;
             ctx.fillStyle = '#ef4444'; // Red
             ctx.fillRect(cx - sz/2, cy - sz/2 + bob, sz, sz);
             ctx.strokeRect(cx - sz/2, cy - sz/2 + bob, sz, sz);
             // Visor
             ctx.fillStyle = '#3b82f6';
             ctx.fillRect(cx - sz/2 + 4, cy - 8 + bob, sz - 8, 8);
             ctx.strokeRect(cx - sz/2 + 4, cy - 8 + bob, sz - 8, 8);
         }
         
         ctx.globalAlpha = 1.0;

         // HP BAR with Black Border
         if (e.maxHp > 1) {
             const barW = 32;
             const barH = 6;
             const pct = e.hp / e.maxHp;
             ctx.fillStyle = '#fff';
             ctx.fillRect(cx - barW/2, cy - PLAYER_SIZE/2 - 16 + bob, barW, barH);
             ctx.strokeStyle = '#000';
             ctx.lineWidth = 1;
             ctx.strokeRect(cx - barW/2, cy - PLAYER_SIZE/2 - 16 + bob, barW, barH);
             
             ctx.fillStyle = pct < 0.3 ? '#ef4444' : '#22c55e';
             ctx.fillRect(cx - barW/2, cy - PLAYER_SIZE/2 - 16 + bob, barW * pct, barH);
             // tick marks
             ctx.beginPath(); ctx.moveTo(cx, cy - PLAYER_SIZE/2 - 16 + bob); ctx.lineTo(cx, cy - PLAYER_SIZE/2 - 16 + bob + barH); ctx.stroke();
         }
    });

    // 6. Draw Players
    state.players.forEach(p => {
       if (p.state === PlayerState.DEAD) return;

       const cx = p.x + PLAYER_SIZE/2;
       const cy = p.y + PLAYER_SIZE/2;
       
       ctx.save();
       if (p.ghostTimer > 0) ctx.globalAlpha = 0.5;

       // Shadow
       ctx.fillStyle = 'rgba(0,0,0,0.2)';
       ctx.beginPath();
       ctx.ellipse(cx, p.y + PLAYER_SIZE, PLAYER_SIZE/2, PLAYER_SIZE/4, 0, 0, Math.PI * 2);
       ctx.fill();

       // Body
       ctx.fillStyle = p.color;
       if (p.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) ctx.fillStyle = '#fff';
       
       ctx.beginPath();
       ctx.arc(cx, cy, PLAYER_SIZE/2, 0, Math.PI * 2);
       ctx.fill();
       ctx.lineWidth = 2;
       ctx.strokeStyle = '#000';
       ctx.stroke();

       if (p.state === PlayerState.TRAPPED) {
           // Trapped Bubble
           ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
           ctx.beginPath();
           ctx.arc(cx, cy, PLAYER_SIZE/2 + 4, 0, Math.PI * 2);
           ctx.fill();
           ctx.stroke();
           
           ctx.fillStyle = '#fff';
           ctx.font = 'bold 12px Arial';
           ctx.fillText("SOS", cx - 10, cy - 20);
       } else {
           // Eyes
           ctx.fillStyle = '#fff';
           ctx.beginPath(); ctx.arc(cx-6, cy-4, 5, 0, Math.PI*2); ctx.stroke(); ctx.fill();
           ctx.beginPath(); ctx.arc(cx+6, cy-4, 5, 0, Math.PI*2); ctx.stroke(); ctx.fill();
           
           // Pupils
           ctx.fillStyle = '#000';
           const dirX = p.direction === Direction.RIGHT ? 2 : p.direction === Direction.LEFT ? -2 : 0;
           const dirY = p.direction === Direction.DOWN ? 2 : p.direction === Direction.UP ? -2 : 0;
           
           ctx.beginPath(); ctx.arc(cx-6+dirX, cy-4+dirY, 2, 0, Math.PI*2); ctx.fill();
           ctx.beginPath(); ctx.arc(cx+6+dirX, cy-4+dirY, 2, 0, Math.PI*2); ctx.fill();
       }
       ctx.restore();

       if (p.hasShield) {
           const time = Date.now() / 200;
           ctx.strokeStyle = '#10b981'; // Green shield
           ctx.setLineDash([5, 5]);
           ctx.lineWidth = 2;
           ctx.beginPath();
           ctx.arc(cx, cy, PLAYER_SIZE/2 + 8, 0, Math.PI*2);
           ctx.stroke();
           ctx.setLineDash([]);
       }
    });

    requestAnimationFrame(draw);
  };

  useEffect(() => {
    let animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
        ref={canvasRef}
        width={GRID_W * TILE_SIZE}
        height={GRID_H * TILE_SIZE}
        className="block bg-white"
    />
  );
};

export default GameCanvas;
