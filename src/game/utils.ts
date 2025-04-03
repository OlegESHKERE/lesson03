import { GameObject } from './types';
import { ENEMY_ROWS, ENEMY_COLS, ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_GAP, ENEMY_SPEED, LEVEL_SPEED_MULTIPLIER } from './constants';

export function detectCollision(obj1: GameObject, obj2: GameObject): boolean {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

export function createEnemyGrid(level: number) {
  const enemies = [];
  const startX = 50;
  const startY = 50;
  
  for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
      enemies.push({
        x: startX + col * (ENEMY_WIDTH + ENEMY_GAP),
        y: startY + row * (ENEMY_HEIGHT + ENEMY_GAP),
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        speed: ENEMY_SPEED * Math.pow(LEVEL_SPEED_MULTIPLIER, level - 1),
        type: row === 0 ? 'advanced' : 'basic',
        points: row === 0 ? 150 : 100,
        dropRate: row === 0 ? 0.2 : 0.1,
      });
    }
  }
  return enemies;
}