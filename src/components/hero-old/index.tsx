import { useEffect, useRef } from 'react';

import SnakeGame from './snake-game';
import logoImg from '~/assets/images/logo.svg';

import './index.scss';

export default function HeroOld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resizeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const runGame = () => {
      if (canvasRef.current) SnakeGame(canvasRef.current);
    };

    runGame();

    const handleResize = () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(runGame, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDirection = (x: number, y: number) => {
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
      <img className="hero-logo" src={logoImg} alt="Code and Bourbon" />
      <div className="mobile-controls">
        <div>
          <button type="button" onClick={() => handleDirection(0, -1)}>▲</button>
        </div>
        <div>
          <button type="button" onClick={() => handleDirection(-1, 0)}>◀</button>
          <button type="button" onClick={() => handleDirection(0, 1)}>▼</button>
          <button type="button" onClick={() => handleDirection(1, 0)}>▶</button>
        </div>
      </div>
    </div>
  );
}
