import React, { useState } from 'react';

import { createStage, checkCollision } from '../gameHelpers';

// Custom Hooks
import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

// Components
import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';

const Tetris: React.FC = () => {
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const { player, updatePlayerPos, resetPlayer, playerRotate } = usePlayer();
  const { score, rows, level, setLevel, calcScore } = useGameStatus();
  
  const { stage, setStage, grid } = useStage(player, resetPlayer, calcScore);

  const movePlayer = (dir: number) => {
    if (!checkCollision(player, grid, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const startGame = () => {
    // Reset everything
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setLevel(0);
  };

  useInterval(() => {
    drop();
  }, dropTime);

  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, grid, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver) {
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const move = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver) {
      if (keyCode === 37) { // Left Arrow: Move Left
        movePlayer(-1);
      } else if (keyCode === 39) { // Right Arrow: Move Right
        movePlayer(1);
      } else if (keyCode === 40) { // Down Arrow: Speed Drop
        dropPlayer();
      } else if (keyCode === 38) { // Up Arrow: Rotate
        playerRotate(grid, 1);
      }
    }
  };

  return (
    <div
      className="tetris-wrapper"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => move(e)}
      onKeyUp={keyUp}
    >
      <div className="tetris-content">
        <Stage stage={stage} />
        <aside className="sidebar">
          {gameOver ? (
            <Display gameOver={gameOver} text="Game Over" />
          ) : (
            <div className="stats-container">
              <Display text={`Score: ${score}`} />
              <Display text={`Rows: ${rows}`} />
              <Display text={`Level: ${level}`} />
            </div>
          )}
          <StartButton callback={startGame} />
        </aside>
      </div>
    </div>
  );
};

export default Tetris;
