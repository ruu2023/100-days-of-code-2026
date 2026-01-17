import React from 'react';
import Cell from './Cell';
import { TETROMINOS } from '../tetrominos';

interface Props {
  stage: (keyof typeof TETROMINOS | 0)[][][];
}

const Stage: React.FC<Props> = ({ stage }) => (
  <div className="stage">
    {stage.map((row, y) =>
      row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0] as keyof typeof TETROMINOS | 0} />)
    )}
  </div>
);

export default Stage;
