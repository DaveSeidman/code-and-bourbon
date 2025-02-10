import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import headerImg from './assets/images/header.png';
import logo from './assets/images/logo.svg';
import './index.scss';

export default function App() {
  const basePath = import.meta.env.BASE_URL || '/';

  return (
    <Router basename={basePath}>
      <Routes>
        <Route
          path="/:page?"
          element={(
            <div className="app">
              <div className="header">
                <div className="header-image">
                  <img src={headerImg} />
                </div>
                <img className="header-logo" src={logo} />
              </div>
              <div className="pages">
                <div className="pages-page who">
                  <h1>Who We Are</h1>
                  <p>We are a group of like-minded individuals, mostly in NYC, that are reclaiming the post-work happy hour we lost during the pandemic. Most of us enjoy Bourbon but it's not at all a requirement, but more of a suggestion that our meetups ecourage a relaxed environment where natural creativity and networking opportinities.</p>
                </div>
                <div className="pages-page where">
                  <h1>Where to Find Us</h1>
                  <p>We meet in various bars and coworking spaces in Brooklyn and Manhattan on a monthly basis.</p>
                  <p>Join the Discord server here to stay up to date.</p>

                </div>
                <div className="pages-page history">
                  <h1>History</h1>
                  <ul>
                    <li>Jan 2024: Windsor Terrace</li>
                    <li>Feb 2024: Dumbo</li>
                    <li>Mar 2024: Gowanus</li>
                    <li>May 2024:  Williamsburg</li>
                    <li>Jun 2024:  Windsor Terrace</li>
                    <li>Sep 2024: Park Slope</li>
                  </ul>
                </div>
                <div className="pages-page join">
                  <h1>One of Us! One of Us!</h1>
                  <p>Join us by setting up a profile here: link</p>
                  <p>You'll receive information about how to join us in person at the next metup!d</p>
                </div>
              </div>
            </div>
          )}
        />
      </Routes>
    </Router>
  );
}
