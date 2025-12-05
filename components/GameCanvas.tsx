
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

    // 1. Draw Grid / Floor
    ctx.fillStyle = '#1e293b'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Walls & Items
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const tile = state.grid[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if ((x + y) % 2 === 0) {
           ctx.fillStyle = '#334155';
           ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        const key = `${x},${y}`;
        if (state.items[key] && tile === TileType.EMPTY) {
            const type = state.items[key];
            let color = '#fff';
            let icon = '';
            
            if (type === ItemType.BOMB_UP) { color = '#000'; icon = '💣'; }
            else if (type === ItemType.RANGE_UP) { color = '#f59e0b'; icon = '⚡'; }
            else if (type === ItemType.SPEED_UP) { color = '#06b6d4'; icon = '👟'; }
            else if (type === ItemType.KICK) { color = '#ec4899'; icon = '🦶'; }
            else if (type === ItemType.GHOST) { color = '#a855f7'; icon = '👻'; }
            else if (type === ItemType.SHIELD) { color = '#10b981'; icon = '🛡️'; }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, px + TILE_SIZE/2, py + TILE_SIZE/2);
        }

        if (tile === TileType.WALL_HARD) {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = '#94a3b8';
          ctx.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else if (tile === TileType.WALL_SOFT) {
          ctx.fillStyle = '#d97706';
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.beginPath();
          ctx.strokeStyle = '#fcd34d';
          ctx.moveTo(px + 4, py + 4);
          ctx.lineTo(px + TILE_SIZE - 4, py + TILE_SIZE - 4);
          ctx.moveTo(px + TILE_SIZE - 4, py + 4);
          ctx.lineTo(px + 4, py + TILE_SIZE - 4);
          ctx.stroke();
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

       ctx.fillStyle = '#000000'; 
       ctx.beginPath();
       ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
       ctx.fill();

       ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
       ctx.beginPath();
       ctx.ellipse(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.35, radius * 0.2, Math.PI / 4, 0, Math.PI * 2);
       ctx.fill();

       ctx.strokeStyle = '#b45309';
       ctx.lineWidth = 2;
       ctx.beginPath();
       ctx.moveTo(centerX, centerY - radius + 2);
       ctx.lineTo(centerX + 6, centerY - radius - 8);
       ctx.stroke();

       ctx.fillStyle = '#ef4444';
       ctx.beginPath();
       ctx.arc(centerX + 6, centerY - radius - 8, 3, 0, Math.PI*2);
       ctx.fill();
       ctx.fillStyle = '#fcd34d';
       ctx.beginPath();
       ctx.arc(centerX + 6, centerY - radius - 8, 1.5, 0, Math.PI*2);
       ctx.fill();
    });

    // 4. Draw Explosions
    state.explosions.forEach(e => {
        const px = e.gridX * TILE_SIZE;
        const py = e.gridY * TILE_SIZE;
        ctx.fillStyle = `rgba(239, 68, 68, ${e.timer / 600})`;
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(px + 10, py + 10, TILE_SIZE - 20, TILE_SIZE - 20);
    });

    // 5. Draw Enemies
    state.enemies.forEach(e => {
         const cx = e.x + PLAYER_SIZE/2;
         const cy = e.y + PLAYER_SIZE/2;
         const bob = Math.sin(Date.now() / 150) * 2;
         
         // Hit flash
         if (e.invincibleTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
             ctx.globalAlpha = 0.5;
         }

         if (e.type === EnemyType.BALLOON) {
             ctx.fillStyle = '#f97316';
             ctx.beginPath();
             ctx.arc(cx, cy + bob, PLAYER_SIZE/2 - 2, 0, Math.PI * 2);
             ctx.fill();
             // Face
             ctx.fillStyle = '#fff';
             ctx.beginPath(); ctx.arc(cx-6, cy-2+bob, 4, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(cx+6, cy-2+bob, 4, 0, Math.PI*2); ctx.fill();
             ctx.fillStyle = '#000';
             ctx.beginPath(); ctx.arc(cx-6, cy-2+bob, 2, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(cx+6, cy-2+bob, 2, 0, Math.PI*2); ctx.fill();
         } 
         else if (e.type === EnemyType.GHOST) {
             ctx.fillStyle = '#a855f7';
             ctx.beginPath();
             ctx.arc(cx, cy - 4 + bob, PLAYER_SIZE/2 - 2, Math.PI, 0);
             ctx.lineTo(cx + PLAYER_SIZE/2 - 2, cy + PLAYER_SIZE/2);
             ctx.lineTo(cx, cy + PLAYER_SIZE/2 - 4);
             ctx.lineTo(cx - PLAYER_SIZE/2 + 2, cy + PLAYER_SIZE/2);
             ctx.fill();
             // Angry Eyes
             ctx.fillStyle = '#fff';
             ctx.beginPath(); ctx.moveTo(cx - 10, cy - 6 + bob); ctx.lineTo(cx - 4, cy - 2 + bob); ctx.lineTo(cx - 10, cy + 2 + bob); ctx.fill();
             ctx.beginPath(); ctx.moveTo(cx + 10, cy - 6 + bob); ctx.lineTo(cx + 4, cy - 2 + bob); ctx.lineTo(cx + 10, cy + 2 + bob); ctx.fill();
         }
         else if (e.type === EnemyType.MINION) {
             ctx.fillStyle = '#facc15'; // Yellow
             ctx.beginPath();
             ctx.arc(cx, cy + bob, PLAYER_SIZE/2 - 6, 0, Math.PI * 2);
             ctx.fill();
             // Cyclops Eye
             ctx.fillStyle = '#fff';
             ctx.beginPath(); ctx.arc(cx, cy-2+bob, 6, 0, Math.PI*2); ctx.fill();
             ctx.fillStyle = '#000';
             ctx.beginPath(); ctx.arc(cx, cy-2+bob, 2, 0, Math.PI*2); ctx.fill();
         }
         else if (e.type === EnemyType.FROG) {
             ctx.fillStyle = '#22c55e'; // Green
             ctx.beginPath();
             ctx.ellipse(cx, cy + bob, PLAYER_SIZE/2, PLAYER_SIZE/3, 0, 0, Math.PI*2);
             ctx.fill();
             // Eyes popping out
             ctx.beginPath(); ctx.arc(cx-8, cy-10+bob, 5, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(cx+8, cy-10+bob, 5, 0, Math.PI*2); ctx.fill();
         }
         else if (e.type === EnemyType.TANK) {
             ctx.fillStyle = '#475569'; // Slate 600
             ctx.fillRect(cx - PLAYER_SIZE/2, cy - PLAYER_SIZE/2 + bob, PLAYER_SIZE, PLAYER_SIZE);
             // Treads
             ctx.fillStyle = '#000';
             ctx.fillRect(cx - PLAYER_SIZE/2 - 2, cy - PLAYER_SIZE/2 + bob, 4, PLAYER_SIZE);
             ctx.fillRect(cx + PLAYER_SIZE/2 - 2, cy - PLAYER_SIZE/2 + bob, 4, PLAYER_SIZE);
             // Cannon
             ctx.fillStyle = '#1e293b';
             ctx.beginPath(); ctx.arc(cx, cy+bob, 8, 0, Math.PI*2); ctx.fill();
             ctx.fillRect(cx-2, cy-12+bob, 4, 12);
         }
         else if (e.type === EnemyType.BOSS_SLIME) {
             const sz = PLAYER_SIZE * 1.5;
             ctx.fillStyle = '#84cc16'; // Lime
             ctx.beginPath();
             ctx.arc(cx, cy + bob, sz/2, 0, Math.PI * 2);
             ctx.fill();
             // Crown
             ctx.fillStyle = '#fbbf24';
             ctx.beginPath();
             ctx.moveTo(cx-10, cy-sz/2+bob); ctx.lineTo(cx-5, cy-sz/2-10+bob); ctx.lineTo(cx, cy-sz/2+bob); ctx.lineTo(cx+5, cy-sz/2-10+bob); ctx.lineTo(cx+10, cy-sz/2+bob);
             ctx.fill();
             // Face
             ctx.fillStyle = '#000';
             ctx.beginPath(); ctx.arc(cx-8, cy+bob, 3, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(cx+8, cy+bob, 3, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.ellipse(cx, cy+8+bob, 4, 6, Math.PI/2, 0, Math.PI); ctx.fill();
         }
         else if (e.type === EnemyType.BOSS_MECHA) {
             const sz = PLAYER_SIZE * 1.5;
             ctx.fillStyle = '#dc2626'; // Red
             ctx.fillRect(cx - sz/2, cy - sz/2 + bob, sz, sz);
             // Visor
             ctx.fillStyle = '#3b82f6';
             ctx.fillRect(cx - sz/2 + 4, cy - 8 + bob, sz - 8, 6);
             // Antenna
             ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
             ctx.beginPath(); ctx.moveTo(cx, cy-sz/2+bob); ctx.lineTo(cx, cy-sz/2-10+bob); ctx.stroke();
             ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx, cy-sz/2-12+bob, 3, 0, Math.PI*2); ctx.fill();
         }
         
         ctx.globalAlpha = 1.0;

         // HP BAR (For tanks and bosses)
         if (e.maxHp > 1) {
             const barW = 24;
             const barH = 4;
             const pct = e.hp / e.maxHp;
             ctx.fillStyle = '#374151';
             ctx.fillRect(cx - barW/2, cy - PLAYER_SIZE/2 - 10 + bob, barW, barH);
             ctx.fillStyle = pct < 0.3 ? '#ef4444' : '#22c55e';
             ctx.fillRect(cx - barW/2, cy - PLAYER_SIZE/2 - 10 + bob, barW * pct, barH);
         }
    });

    // 6. Draw Players
    state.players.forEach(p => {
       if (p.state === PlayerState.DEAD) return;

       const cx = p.x + PLAYER_SIZE/2;
       const cy = p.y + PLAYER_SIZE/2;
       
       ctx.save();
       if (p.ghostTimer > 0) ctx.globalAlpha = 0.5 + Math.sin(Date.now()/100) * 0.2;

       ctx.fillStyle = 'rgba(0,0,0,0.3)';
       ctx.beginPath();
       ctx.ellipse(cx, p.y + PLAYER_SIZE, PLAYER_SIZE/2, PLAYER_SIZE/4, 0, 0, Math.PI * 2);
       ctx.fill();

       ctx.fillStyle = p.color;
       if (p.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) ctx.fillStyle = '#fff';
       
       if (p.state === PlayerState.TRAPPED) {
           ctx.beginPath();
           ctx.arc(cx, cy, PLAYER_SIZE/3, 0, Math.PI * 2);
           ctx.fill();
           ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
           ctx.strokeStyle = '#fff';
           ctx.lineWidth = 2;
           ctx.beginPath();
           ctx.arc(cx, cy, PLAYER_SIZE/2 + 2, 0, Math.PI * 2);
           ctx.fill();
           ctx.stroke();
           ctx.fillStyle = '#fff';
           ctx.font = 'bold 10px Arial';
           ctx.fillText("SOS", cx, cy - PLAYER_SIZE/2 - 5);
       } else {
           ctx.beginPath();
           ctx.arc(cx, cy, PLAYER_SIZE/2, 0, Math.PI * 2);
           ctx.fill();
           ctx.fillStyle = '#fff';
           ctx.beginPath(); ctx.arc(cx-6, cy-4, 4, 0, Math.PI*2); ctx.arc(cx+6, cy-4, 4, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#000';
           ctx.beginPath(); ctx.arc(cx-6, cy-4, 2, 0, Math.PI*2); ctx.arc(cx+6, cy-4, 2, 0, Math.PI*2); ctx.fill();
       }
       ctx.restore();

       if (p.hasShield) {
           const time = Date.now() / 200;
           ctx.strokeStyle = `hsl(${time * 50}, 70%, 70%)`;
           ctx.lineWidth = 2;
           ctx.beginPath();
           ctx.arc(cx, cy, PLAYER_SIZE/2 + 6 + Math.sin(time)*2, 0, Math.PI*2);
           ctx.stroke();
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
        className="block bg-black"
    />
  );
};

export default GameCanvas;
