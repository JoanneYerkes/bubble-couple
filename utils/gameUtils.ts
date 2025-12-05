
import { GRID_W, GRID_H, TILE_SIZE, PLAYER_SIZE } from '../constants';
import { Coordinates, TileType, ItemType } from '../types';

export const getGridCoords = (pixelX: number, pixelY: number): Coordinates => {
  return {
    x: Math.floor((pixelX + PLAYER_SIZE / 2) / TILE_SIZE),
    y: Math.floor((pixelY + PLAYER_SIZE / 2) / TILE_SIZE),
  };
};

export const getPixelCoords = (gridX: number, gridY: number): Coordinates => {
  return {
    x: gridX * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2,
    y: gridY * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2,
  };
};

// Check if a rectangle overlaps with a grid cell
export const isColliding = (
  px: number,
  py: number,
  gridX: number,
  gridY: number
): boolean => {
  const tileLeft = gridX * TILE_SIZE;
  const tileRight = tileLeft + TILE_SIZE;
  const tileTop = gridY * TILE_SIZE;
  const tileBottom = tileTop + TILE_SIZE;

  const playerLeft = px;
  const playerRight = px + PLAYER_SIZE;
  const playerTop = py;
  const playerBottom = py + PLAYER_SIZE;

  return (
    playerLeft < tileRight &&
    playerRight > tileLeft &&
    playerTop < tileBottom &&
    playerBottom > tileTop
  );
};

// Simple AABB collision between two players
export const checkPlayerCollision = (p1: {x:number, y:number}, p2: {x:number, y:number}) => {
  return (
    p1.x < p2.x + PLAYER_SIZE &&
    p1.x + PLAYER_SIZE > p2.x &&
    p1.y < p2.y + PLAYER_SIZE &&
    p1.y + PLAYER_SIZE > p2.y
  );
};

// Corner Sliding / Smoothing Logic
// If player hits a wall but is mostly aligned with a free lane, nudge them
export const correctPosition = (
  x: number,
  y: number,
  dx: number,
  dy: number,
  grid: TileType[][]
): { x: number; y: number } => {
  let newX = x + dx;
  let newY = y + dy;

  // Collision box corners
  const corners = [
    { x: newX, y: newY }, // Top-Left
    { x: newX + PLAYER_SIZE - 0.1, y: newY }, // Top-Right
    { x: newX, y: newY + PLAYER_SIZE - 0.1 }, // Bottom-Left
    { x: newX + PLAYER_SIZE - 0.1, y: newY + PLAYER_SIZE - 0.1 }, // Bottom-Right
  ];

  for (const corner of corners) {
    const gx = Math.floor(corner.x / TILE_SIZE);
    const gy = Math.floor(corner.y / TILE_SIZE);

    // Check bounds
    if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) {
      // Hard stop on boundary
      if (dx !== 0) newX = x;
      if (dy !== 0) newY = y;
      continue;
    }

    // Check Wall
    if (grid[gy][gx] !== TileType.EMPTY) {
        // If moving horizontally
        if (dx !== 0) {
            newX = x; 
        }
        // If moving vertically
        if (dy !== 0) {
            newY = y;
        }
    }
  }

  return { x: newX, y: newY };
};

export const createInitialGrid = (wallDensity: number = 0.6): { grid: TileType[][], items: {[key:string]: number} } => {
  const grid: TileType[][] = [];
  const items: {[key:string]: number} = {};

  for (let y = 0; y < GRID_H; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < GRID_W; x++) {
      // Borders are hard walls
      if (y === 0 || y === GRID_H - 1 || x === 0 || x === GRID_W - 1) {
        row.push(TileType.WALL_HARD);
      } 
      // Fixed Hard Wall Pattern (every 2nd tile)
      else if (y % 2 === 0 && x % 2 === 0) {
        row.push(TileType.WALL_HARD);
      } 
      // Spawn areas (Top Left, Bottom Right) are clear
      else if (
        (x < 3 && y < 3) || 
        (x > GRID_W - 4 && y > GRID_H - 4)
      ) {
        row.push(TileType.EMPTY);
      } 
      // Random Soft Walls (Boxes)
      else {
        if (Math.random() < wallDensity) { 
          row.push(TileType.WALL_SOFT);
          // Pre-determine item drop
          if (Math.random() < 0.35) { // 35% chance of item in a box
             const rand = Math.random();
             let type = ItemType.NONE;
             
             // Weighted random for items
             if (rand < 0.3) type = ItemType.RANGE_UP;
             else if (rand < 0.55) type = ItemType.BOMB_UP;
             else if (rand < 0.75) type = ItemType.SPEED_UP;
             else if (rand < 0.85) type = ItemType.KICK; // 10%
             else if (rand < 0.95) type = ItemType.SHIELD; // 10%
             else type = ItemType.GHOST; // 5%
             
             items[`${x},${y}`] = type;
          }
        } else {
          row.push(TileType.EMPTY);
        }
      }
    }
    grid.push(row);
  }
  return { grid, items };
};
