import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Hero from './components/hero';
import Events from './components/events';
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
              {/* <div className="header">
                <div className="header-image">
                  <img src={headerImg} />
                </div>
                <img className="header-logo" src={logo} />
              </div> */}
              <Hero />

              <div className="pages">
                <div className="pages-page who">
                  <h1>WhoWeAre</h1>
                  <p>We are a group of like-minded individuals, mostly in NYC, that are reclaiming the post-work happy hour we lost during the pandemic. Most of us enjoy Bourbon but it's not at all a requirement, but more of a suggestion that our meetups ecourage a relaxed environment where natural creativity and networking opportinities.</p>
                </div>
                <Events />
                <div className="pages-page join">
                  <h1>OneOfUsOneOfUs</h1>
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
