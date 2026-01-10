import React, { useState, useEffect, useRef } from "react";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (time) => {
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const milliseconds = Math.floor((time / 10) % 100);

    return (
      <div className="time-display">
        <span className="digits">{("0" + minutes).slice(-2)}:</span>
        <span className="digits">{("0" + seconds).slice(-2)}</span>
        <span className="milliseconds">.{("0" + milliseconds).slice(-2)}</span>
      </div>
    );
  };

  return (
    <div className="stopwatch">
      {formatTime(time)}
      <div className="buttons">
        {!isRunning ? (
          <button className="btn start" onClick={handleStart}>
            Start
          </button>
        ) : (
          <button className="btn stop" onClick={handleStop}>
            Stop
          </button>
        )}
        <button className="btn reset" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default Stopwatch;
