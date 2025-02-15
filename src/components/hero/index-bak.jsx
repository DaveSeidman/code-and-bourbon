import React, { useState, useRef, useEffect } from 'react';
import image1 from '../../assets/images/header1.png';
import image2 from '../../assets/images/header2.png';
import image3 from '../../assets/images/header3.png';
import logo from '../../assets/images/logo.svg';

import './index.scss';

export default function Hero() {
  const images = [image1, image2, image3];
  const imagesRef = useRef();
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  const pointer = useRef({ down: false, x: 0.5, y: 0.5, vx: 0, vy: 0 });
  const prevPointer = useRef({ x: 0.5, y: 0.5 });
  const animationRef = useRef();
  const canvasRef = useRef();
  const contextRef = useRef();

  const animate = () => {
    if (contextRef.current) {
      // contextRef.current.clearRect(0, 0, width, height);
      if (pointer.current.down) {
        pointer.current.vx = prevPointer.current.x - pointer.current.x;
        pointer.current.vy = prevPointer.current.y - pointer.current.y;
      } else {
        pointer.current.vx *= 0.95;
        pointer.current.vy *= 0.95;
        pointer.current.x -= pointer.current.vx;
        pointer.current.y -= pointer.current.vy;
      }
      contextRef.current.beginPath();
      contextRef.current.arc(pointer.current.x * width, pointer.current.y * height, 15, 0, Math.PI * 2);
      contextRef.current.fillStyle = 'red';
      contextRef.current.fill();
    }

    animationRef.current = requestAnimationFrame(animate);
  };
  const pointerDown = (e) => {
    pointer.current.down = true;
  };
  const pointerUp = (e) => {
    pointer.current.down = false;
  };
  const pointerMove = (e) => {
    prevPointer.current = pointer.current;
    pointer.current = {
      x: e.clientX / width,
      y: e.clientY / height,
      down: pointer.current.down,
      vx: pointer.current.vx,
      vy: pointer.current.vy,
    };
  };

  useEffect(() => {
    const resize = () => {
      // if (!imagesRef.current || !canvasRef.current) return;
      const { width, height } = imagesRef?.current.getBoundingClientRect();
      console.log({ width, height });
      setWidth(width);
      setHeight(height);

      // TODO: set these as JSX params?
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      contextRef.current = canvasRef.current.getContext('2d');
    };

    window.addEventListener('resize', resize);
    resize();

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [imagesRef, width, height]);

  useEffect(() => {
    if (canvasRef.current) contextRef.current = canvasRef.current.getContext('2d');
  }, [canvasRef]);

  return (
    <div
      className="hero"
      onPointerMove={pointerMove}
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
    >
      <div className="hero-images" ref={imagesRef}>
        {images.map((image, index) => (
          <img key={index} className="hero-images-image" src={image} alt={`Background ${index}`} />
        ))}
      </div>

      <canvas
        className="hero-canvas"
        ref={canvasRef}

      />

      <div className="hero-logo">
        <img className="hero-logo-image" src={logo} alt="Logo" />
      </div>
    </div>
  );
}
