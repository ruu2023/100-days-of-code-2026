import React from 'react';
import { TETROMINOS } from '../tetrominos';

interface Props {
  type: keyof typeof TETROMINOS | 0;
}

const Cell: React.FC<Props> = ({ type }) => {
  const color = TETROMINOS[type] ? TETROMINOS[type].color : '0, 0, 0';
  const isFilled = type !== 0;

  return (
    <div
      className={`cell ${isFilled ? 'filled' : ''}`}
      style={{
        background: isFilled ? `rgba(${color}, 0.8)` : 'rgba(0, 0, 0, 0.1)',
        borderBottom: isFilled ? `4px solid rgba(${color}, 0.1)` : 'none',
        borderRight: isFilled ? `4px solid rgba(${color}, 1)` : 'none',
        borderTop: isFilled ? `4px solid rgba(${color}, 1)` : 'none',
        borderLeft: isFilled ? `4px solid rgba(${color}, 0.3)` : 'none',
        boxShadow: isFilled ? `0 0 20px rgba(${color}, 0.5)` : 'none',
      }}
    />
  );
};

export default React.memo(Cell);
