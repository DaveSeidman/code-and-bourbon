import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/hero';
import Events from './components/events';
import User from './components/user';
import './index.scss';

export default function App() {
  const basePath = import.meta.env.BASE_URL || '/';

  return (
    <Router basename={basePath}>
      <div className="app">

        <Routes>

          <Route
            path="/:page?"
            element={(
              <>
                <Hero />
                <div className="pages">
                  <div className="pages-page who">
                    <h1>WhoWeAre</h1>
                    <p>We are a group of like-minded individuals, mostly in NYC, that are reclaiming the post-work happy hour we lost during the pandemic. Most of us enjoy Bourbon but it's not at all a requirement, but more of a suggestion that our meetups encourage a relaxed environment where natural creativity and networking opportunities.</p>
                  </div>
                  <Events />
                  <div className="pages-page join">
                    <h1>OneOfUsOneOfUs</h1>
                    <a href="https://discord.gg/v68Dv4vVBA" target="discord">Join Us on Discord!</a>
                    <p>You'll receive information about how to join us in person at the next meetup!</p>
                  </div>
                </div>
                <User />
              </>
            )}
          />
          <Route
            path="/page1"
            element={
              <div className="app2" />
            }
          />
        </Routes>
      </div>

    </Router>
  );
}
