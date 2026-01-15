import { useEffect, useRef, useState } from 'react';

type Point = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  color: string;
  isDrawing: boolean;
};

const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color] = useState(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
  const ws = useRef<WebSocket | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080/ws');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
      setConnectionStatus("Connected");
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnectionStatus("Disconnected");
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      setConnectionStatus("Error");
    };

    ws.current.onmessage = (event) => {
      // console.log("Received drawing event:", event.data);
      const msg: Point = JSON.parse(event.data);
      drawOnCanvas(msg.x, msg.y, msg.prevX, msg.prevY, msg.color);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const drawOnCanvas = (x: number, y: number, prevX: number, prevY: number, strokeColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current || !ws.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const msg: Point = {
      x,
      y,
      prevX: lastPos.current.x,
      prevY: lastPos.current.y,
      color,
      isDrawing: true,
    };

    // Draw locally immediately for better latency
    drawOnCanvas(x, y, lastPos.current.x, lastPos.current.y, color);

    // Send to server
    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }

    lastPos.current = { x, y };
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Real-time Collaborative Drawing</h2>
      <div style={{ marginBottom: '10px' }}>
        <p>Status: <span style={{ 
          fontWeight: 'bold', 
          color: connectionStatus === 'Connected' ? 'green' : 'red' 
        }}>{connectionStatus}</span></p>
        <p>Your Color: <span style={{ color: color, fontWeight: 'bold' }}>{color}</span></p>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
        style={{
          border: '2px solid #333',
          background: '#fff',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
};

export default DrawingCanvas;
