export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Player extends GameObject {
  lives: number;
  shield: boolean;
  rapidFire: boolean;
  cooldown: number;
}

export interface Enemy extends GameObject {
  type: 'basic' | 'advanced';
  points: number;
  dropRate: number;
}

export interface Bullet extends GameObject {
  isPlayer: boolean;
}

export interface PowerUp extends GameObject {
  type: 'shield' | 'rapidFire';
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  score: number;
  level: number;
  gameOver: boolean;
  isPaused: boolean;
}