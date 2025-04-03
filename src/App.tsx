import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, 
  PLAYER_INITIAL_LIVES, BULLET_WIDTH, BULLET_HEIGHT, BULLET_SPEED, BULLET_COOLDOWN, 
  RAPID_FIRE_COOLDOWN, POWER_UP_DURATION } from './game/constants';
import { detectCollision, createEnemyGrid } from './game/utils';
import GameCanvas from './components/GameCanvas';
import { Rocket } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: PLAYER_SPEED,
      lives: PLAYER_INITIAL_LIVES,
      shield: false,
      rapidFire: false,
      cooldown: 0
    },
    enemies: createEnemyGrid(1),
    bullets: [],
    powerUps: [],
    score: 0,
    level: 1,
    gameOver: false,
    isPaused: false
  });

  const [keys, setKeys] = useState(new Set<string>());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updateGame = useCallback(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    setGameState(prev => {
      const newState = { ...prev };

      // Update player position
      if (keys.has('ArrowLeft')) {
        newState.player.x = Math.max(0, newState.player.x - newState.player.speed);
      }
      if (keys.has('ArrowRight')) {
        newState.player.x = Math.min(
          CANVAS_WIDTH - PLAYER_WIDTH,
          newState.player.x + newState.player.speed
        );
      }

      // Player shooting
      if (keys.has(' ') && newState.player.cooldown <= 0) {
        newState.bullets.push({
          x: newState.player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
          y: newState.player.y,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          speed: BULLET_SPEED,
          isPlayer: true
        });
        newState.player.cooldown = newState.player.rapidFire ? 
          RAPID_FIRE_COOLDOWN : BULLET_COOLDOWN;
      }
      newState.player.cooldown = Math.max(0, newState.player.cooldown - 16);

      // Update bullets
      newState.bullets = newState.bullets.filter(bullet => {
        bullet.y += bullet.isPlayer ? -bullet.speed : bullet.speed;
        return bullet.y > 0 && bullet.y < CANVAS_HEIGHT;
      });

      // Update enemies
      let direction = 1;
      let shouldDrop = false;
      
      newState.enemies.forEach(enemy => {
        if (enemy.x <= 0 || enemy.x + enemy.width >= CANVAS_WIDTH) {
          direction = -direction;
          shouldDrop = true;
        }
      });

      newState.enemies = newState.enemies.map(enemy => ({
        ...enemy,
        x: enemy.x + (enemy.speed * direction),
        y: shouldDrop ? enemy.y + 20 : enemy.y
      }));

      // Check collisions
      newState.bullets.forEach(bullet => {
        if (bullet.isPlayer) {
          newState.enemies = newState.enemies.filter(enemy => {
            if (detectCollision(bullet, enemy)) {
              // Add score
              newState.score += enemy.points;

              // Chance to drop power-up
              if (Math.random() < enemy.dropRate) {
                newState.powerUps.push({
                  x: enemy.x,
                  y: enemy.y,
                  width: 20,
                  height: 20,
                  speed: 2,
                  type: Math.random() < 0.5 ? 'shield' : 'rapidFire'
                });
              }

              return false;
            }
            return true;
          });
        } else if (!newState.player.shield && detectCollision(bullet, newState.player)) {
          newState.player.lives--;
          if (newState.player.lives <= 0) {
            newState.gameOver = true;
          }
        }
      });

      // Update power-ups
      newState.powerUps = newState.powerUps.filter(powerUp => {
        powerUp.y += powerUp.speed;
        
        if (detectCollision(powerUp, newState.player)) {
          if (powerUp.type === 'shield') {
            newState.player.shield = true;
            setTimeout(() => {
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, shield: false }
              }));
            }, POWER_UP_DURATION);
          } else {
            newState.player.rapidFire = true;
            setTimeout(() => {
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, rapidFire: false }
              }));
            }, POWER_UP_DURATION);
          }
          return false;
        }
        
        return powerUp.y < CANVAS_HEIGHT;
      });

      // Check for level completion
      if (newState.enemies.length === 0) {
        newState.level++;
        newState.enemies = createEnemyGrid(newState.level);
      }

      // Check for game over (enemies reaching player)
      if (newState.enemies.some(enemy => enemy.y + enemy.height >= newState.player.y)) {
        newState.gameOver = true;
      }

      return newState;
    });
  }, [gameState.gameOver, gameState.isPaused, keys]);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 16);
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  const restartGame = () => {
    setGameState({
      player: {
        x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: PLAYER_SPEED,
        lives: PLAYER_INITIAL_LIVES,
        shield: false,
        rapidFire: false,
        cooldown: 0
      },
      enemies: createEnemyGrid(1),
      bullets: [],
      powerUps: [],
      score: 0,
      level: 1,
      gameOver: false,
      isPaused: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Rocket className="text-blue-500" size={32} />
          <h1 className="text-4xl font-bold text-white">Space Defenders</h1>
        </div>
        
        <GameCanvas gameState={gameState} />
        
        {gameState.gameOver && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-gray-300 mb-4">Final Score: {gameState.score}</p>
            <button
              onClick={restartGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Play Again
            </button>
          </div>
        )}
        
        <div className="mt-4 text-gray-400 text-sm">
          <p>Use ← → to move and SPACE to shoot</p>
          <p>Collect power-ups for shields and rapid fire!</p>
        </div>
      </div>
    </div>
  );
}

export default App;