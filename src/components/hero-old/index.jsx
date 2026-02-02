import React, { useEffect, useRef } from 'react';

import logoImg from '../../assets/images/logo.svg';
import './index.scss';
import SnakeGame from './snake-game';

export default function Hero() {
  const canvasRef = useRef(null);
  const resizeTimeout = useRef(null);

  useEffect(() => {
    const runGame = () => {
      if (canvasRef.current) SnakeGame(canvasRef.current);
    };

    runGame();

    const handleResize = () => {
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(runGame, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDirection = (x, y) => {
    const event = new KeyboardEvent('keydown', {
      key:
        y === -1
          ? 'ArrowUp'
          : y === 1
            ? 'ArrowDown'
            : x === -1
              ? 'ArrowLeft'
              : x === 1
                ? 'ArrowRight'
                : '',
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="hero">
      <div className="hero-snake">
        <canvas ref={canvasRef} />
      </div>
      <img className="hero-logo" src={logoImg} />
      <div className="mobile-controls">
        <div>
          <button onClick={() => handleDirection(0, -1)}>▲</button>
        </div>
        <div>
          <button onClick={() => handleDirection(-1, 0)}>◀</button>
          <button onClick={() => handleDirection(0, 1)}>▼</button>
          <button onClick={() => handleDirection(1, 0)}>▶</button>
        </div>
      </div>
    </div>
  );
}
