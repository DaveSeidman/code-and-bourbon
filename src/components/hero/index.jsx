// TODO, create a color, ASCII art version of the header image, then react to pointer events by swapping portions of the image out with the ascii for that location, let the ascii art hang for a few seconds and fade back to the image so that the user can create trails of code by dragging that still resemble the image

import React, { useState, useRef, useEffect } from 'react';
import headerImg from '../../assets/images/header.png';
import logo from '../../assets/images/logo.svg';

import './index.scss';

export default function Hero() {
  const rem = 16;
  const size = 60;
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [arrayLength, setArrayLength] = useState(0);
  const [cells, setCells] = useState(new Array(100).fill({ active: false }));

  const cellsRef = useRef();

  useEffect(() => {
    const resize = () => {
      setWidth(cellsRef.current.getBoundingClientRect().width);
      setHeight(cellsRef.current.getBoundingClientRect().height);
    };
    addEventListener('resize', resize);

    resize();
    return (() => {
      removeEventListener('resize', resize);
    });
  }, []);

  useEffect(() => {
    // console.log(width, height);
    const cols = Math.ceil(width / size);
    const rows = Math.ceil(height / size);
    setArrayLength(cols * rows);
  }, [width, height]);

  useEffect(() => {
    setCells(new Array(arrayLength).fill(null).map((_, index) => {
      const cols = Math.ceil(width / size);
      const rows = Math.ceil(height / size);
      console.log('left', index, cols, index % cols);
      return ({
        id: `cell-${index}`,
        active: false,
        top: Math.floor(index / cols) * size,
        left: (index % cols) * size,
      });
    }));
  }, [arrayLength]);

  return (
    <div className="hero">
      <div className="hero-image">
        <img src={headerImg} />
      </div>
      <div
        className="hero-cells"
        ref={cellsRef}
      >
        {
          cells.map((cell) => (
            <span
              key={cell.id}
              className={`hero-cells-cell ${cell.active ? 'active' : ''}`}
              style={{
                top: cell.top,
                left: cell.left,
                width: size,
                height: size,
              }}
              onPointerMove={(e) => {
                e.target.classList.add('active');
                setTimeout(() => { e.target.classList.remove('active'); }, 2000);
              }}
            />
          ))
        }
      </div>
      <div className="hero-logo">
        <img className="hero-logo-image" src={logo} />
      </div>
    </div>
  );
}
