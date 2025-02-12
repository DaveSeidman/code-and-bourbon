import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/hero';
import About from './components/about';
import Events from './components/events';
import Join from './components/join';
import User from './components/user';
import Footer from './components/footer';
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
                  <About />
                  <Events />
                  <Join />
                </div>
                <Footer />
                <User />

              </>
            )}
          />
          <Route
            path="/input"
            element={
              <div className="input" />
            }
          />
          <Route
            path="/output"
            element={(
              <div className="outout">
                <h1>output</h1>
                <p>Let's write a section about what Code & Bourbon can give back to the community. Finding a job or a mentor. Learning a new skill, etc.</p>
              </div>
            )}
          />
        </Routes>
      </div>

    </Router>
  );
}
