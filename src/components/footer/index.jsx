import React from 'react';
import './index.scss';

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-links">
        <a href="/about">About Us</a>
        <a href="/contact">Get In Touch</a>
        <a href="/donate">Donate</a>
      </div>
      <div className="footer-logo" />
    </div>
  );
}
