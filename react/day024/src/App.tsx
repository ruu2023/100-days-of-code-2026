import React, { useState } from 'react'

const BOARD_SIZE = 15;

const calculateWinner = (squares: (string | null)[]) => {
  // 横、縦、斜め（右下）、斜め（左下）の方向
  const directions = [
    [1, 0],   // 横
    [0, 1],   // 縦
    [1, 1],   // 斜め右下
    [1, -1],  // 斜め左下
  ];

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const current = squares[i];
    if (!current) continue;

    const x = i % BOARD_SIZE;
    const y = Math.floor(i / BOARD_SIZE);

    for (const [dx, dy] of directions) {
      let count = 1;
      // Check forward
      for (let step = 1; step < 5; step++) {
        const nx = x + dx * step;
        const ny = y + dy * step;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
        if (squares[ny * BOARD_SIZE + nx] !== current) break;
        count++;
      }
      
      if (count === 5) return current;
    }
  }
  return null;
};

const App = () => {
  const [squares, setSquares] = useState<(string | null)[]>(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner === 'B' ? '黒 (Black)' : '白 (White)'}`;
  } else if (!squares.includes(null)) {
    status = 'Draw';
  } else {
    status = `Next player: ${xIsNext ? '黒 (Black)' : '白 (White)'}`;
  }

  const handleClick = (i: number) => {
    if (squares[i] || winner) {
      return;
    }
    
    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? 'B' : 'W';

    setSquares(newSquares);
    setXIsNext(!xIsNext);
  }

  const resetGame = () => {
    setSquares(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setXIsNext(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '10px' }}>{status}</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 30px)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, 30px)`,
        gap: '1px',
        backgroundColor: '#333',
        padding: '1px',
        border: '5px solid #8B4513',
        borderRadius: '4px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      }}>
        {squares.map((value, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: '#DEB887', // Burlywood (Wood color)
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: winner || value ? 'default' : 'pointer',
              position: 'relative',
            }}
          >
             {/* Grid intersection dot/line styling could go here, but keep it simple first */}
            {value === 'B' ? (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'black',
                boxShadow: '2px 2px 2px rgba(0,0,0,0.4)',
                background: 'radial-gradient(circle at 30% 30%, #444, #000)',
              }} />
            ) : value === 'W' ? (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: '2px 2px 2px rgba(0,0,0,0.4)',
                background: 'radial-gradient(circle at 30% 30%, #fff, #ddd)',
              }} />
            ) : null}
          </div>
        ))}
      </div>
      <button 
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          fontSize: '16px', 
          cursor: 'pointer',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }} 
        onClick={resetGame}
      >
        リセット (Reset)
      </button>
    </div>
  )
}

export default App