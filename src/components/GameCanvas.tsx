import React, { useRef, useEffect } from 'react';
import { GameState } from '../game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';
import { Shield, Zap } from 'lucide-react';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw player
    ctx.fillStyle = gameState.player.shield ? '#4CAF50' : '#2196F3';
    ctx.fillRect(
      gameState.player.x,
      gameState.player.y,
      gameState.player.width,
      gameState.player.height
    );

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      ctx.fillStyle = enemy.type === 'advanced' ? '#F44336' : '#FF9800';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw bullets
    gameState.bullets.forEach(bullet => {
      ctx.fillStyle = bullet.isPlayer ? '#FFFFFF' : '#FF0000';
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw power-ups
    gameState.powerUps.forEach(powerUp => {
      ctx.fillStyle = powerUp.type === 'shield' ? '#4CAF50' : '#E91E63';
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
  }, [gameState]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="bg-gray-900 rounded-lg shadow-lg"
      />
      <div className="absolute top-4 left-4 text-white font-bold">
        <div>Score: {gameState.score}</div>
        <div>Level: {gameState.level}</div>
        <div>Lives: {'❤️'.repeat(gameState.player.lives)}</div>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        {gameState.player.shield && (
          <Shield className="text-green-500" size={24} />
        )}
        {gameState.player.rapidFire && (
          <Zap className="text-pink-500" size={24} />
        )}
      </div>
    </div>
  );
};

export default GameCanvas;