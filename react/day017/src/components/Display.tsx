import React from 'react';

interface Props {
  gameOver?: boolean;
  text: string;
}

const Display: React.FC<Props> = ({ gameOver, text }) => (
  <div className={`display ${gameOver ? 'game-over' : ''}`}>{text}</div>
);

export default Display;
