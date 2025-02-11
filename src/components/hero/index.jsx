// TODO, create a color, ASCII art version of the header image, then react to pointer events by swapping portions of the image out with the ascii for that location, let the ascii art hang for a few seconds and fade back to the image so that the user can create trails of code by dragging that still resemble the image

import React, { useState, useRef, useEffect } from 'react';
import headerImg from '../../assets/images/header.png';
import logo from '../../assets/images/logo.svg';

import './index.scss';

export default function Hero() {
  const amount = 16;
  const [size, setSize] = useState(100);
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
    if (!height) return;
    // console.log(width, height);
    const nextSize = height / amount;
    setSize(nextSize);
    const cols = Math.ceil(width / nextSize);
    const rows = Math.ceil(height / nextSize);
    setArrayLength(cols * rows);
  }, [width, height]);

  useEffect(() => {
    setCells(new Array(arrayLength || 1).fill(null).map((_, index) => ({
      id: `cell-${index}`,
      active: false,
      top: height ? Math.floor(index / (Math.ceil(width / size))) * size : 0,
      left: height ? (index % Math.ceil(width / size)) * size : 0,
      char: Math.round(Math.random()),
    })));
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
                fontSize: size,
                lineHeight: `${size}px`,
              }}
              onPointerMove={(e) => {
                e.target.classList.add('active');
                setTimeout(() => { e.target.classList.remove('active'); }, 2000);
              }}
            >
              {cell.char}
            </span>
          ))
        }
      </div>
      <div className="hero-logo">
        <img className="hero-logo-image" src={logo} />
      </div>
    </div>
  );
}
