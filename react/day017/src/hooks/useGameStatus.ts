import { useState } from 'react';

export const useGameStatus = () => {
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  const calcScore = (rowsCleared: number, points?: number[]) => {
    // We have linePoints inside the function or passed as argument.
    // Let's safe guard access.
    const linePoints = points || [40, 100, 300, 1200];
    const point = linePoints[rowsCleared - 1] || linePoints[linePoints.length - 1]; 
    if (point) {
      setScore((prev) => prev + point * (level + 1));
      setRows((prev) => prev + rowsCleared);
      setLevel((prev) => prev + Math.floor((rows + rowsCleared) / 10)); 
    }
  };

  return { score, setScore, rows, setRows, level, setLevel, calcScore };
};
