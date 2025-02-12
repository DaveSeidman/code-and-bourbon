import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/hero';
import Events from './components/events';
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
                  <div className="pages-page who">
                    <h1>Who We Are</h1>
                    <p>Coding is a Science, but it's also an Art, and art can be painful. The point of this meetup is to get together and discuss the satisfying victories and embarrassing failures we encounter on our journey to becoming better coders.</p>
                    <p>Alcohol is <u>not a requirement!</u> In fact the only beverages that are NOT permitted at this meetup are ones containing caffeine ☕️ This is the cool-down, the happy hour, the retrospective. It's a chance for us to collectively take a breath, make friends, and play nice.</p>
                  </div>
                  <Events />
                  <div className="pages-page join">
                    <h1>OneOfUsOneOfUs</h1>
                    <a href="https://discord.gg/v68Dv4vVBA" target="discord">Join Us on Discord!</a>
                    <p>You'll receive information about how to join us in person at the next meetup!</p>
                  </div>
                </div>
                <Footer />
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
