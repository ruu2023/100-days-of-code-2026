import { useState, useEffect } from 'react';
import { createStage } from '../gameHelpers';

// Define the type for a cell
type Cell = [string | number, string];

export const useStage = (player: any, resetPlayer: () => void, onRowsCleared?: (rows: number) => void) => {
  // grid is the underlying state that only contains merged (locked) blocks
  const [grid, setGrid] = useState(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);
  const [stage, setStage] = useState(grid);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = (newGrid: Cell[][]) => {
      let cleared = 0;
      const res = newGrid.reduce((ack, row) => {
        if (row.findIndex((cell) => cell[0] === 0) === -1) {
          cleared += 1;
          ack.unshift(new Array(newGrid[0].length).fill([0, 'clear']));
          return ack;
        }
        ack.push(row);
        return ack;
      }, [] as Cell[][]);
      
      if (cleared > 0 && onRowsCleared) {
        onRowsCleared(cleared);
      }
      setRowsCleared(cleared);
      return res;
    };

    if (player.collided) {
      setGrid((prevGrid) => {
        // 1. Copy previous grid
        const newGrid = prevGrid.map((row) => row.map((cell) => cell)) as Cell[][];
        
        // 2. Lock the tetromino
        player.tetromino.forEach((row: any[], y: number) => {
          row.forEach((value: any, x: number) => {
            if (value !== 0) {
              const targetY = y + player.pos.y;
              const targetX = x + player.pos.x;
              // Boundary check to prevent errors
              if (newGrid[targetY] && newGrid[targetY][targetX]) {
                 newGrid[targetY][targetX] = [value, 'merged'];
              }
            }
          });
        });
        
        // 3. Clear rows and reset player
        resetPlayer();
        return sweepRows(newGrid);
      });
    }
  }, [player.collided, player.pos.x, player.pos.y, player.tetromino, resetPlayer]);

  // Generate the display stage by combining grid and player
  useEffect(() => {
    const newStage = grid.map((row) => row.map((cell) => cell)) as Cell[][];

    // Draw the tetromino
    player.tetromino.forEach((row: any[], y: number) => {
      row.forEach((value: any, x: number) => {
        if (value !== 0) {
          const targetY = y + player.pos.y;
          const targetX = x + player.pos.x;
           if (newStage[targetY] && newStage[targetY][targetX] && newStage[targetY][targetX][1] === 'clear') {
            newStage[targetY][targetX] = [value, 'clear'];
          }
        }
      });
    });

    setStage(newStage);
  }, [player, grid]);

  // Return stage for rendering, grid for collision detection
  return { stage, setStage: setGrid, rowsCleared, grid };
};
