import React from 'react';
import './index.scss';

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-links">
        <a href="/">About Us</a>
        <a href="mailto:daveseidman+codeandbourbon@gmail.com?subject=%F0%9F%A5%83%20Code%20%26%20Bourbon%21">Get In Touch!</a>
        <a target="venmo" href="https://venmo.com/u/Dave-Seidman-1">Donate</a>
      </div>
      <div className="footer-logo" />
    </div>
  );
}
