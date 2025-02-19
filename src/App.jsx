import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/hero';
import About from './components/about';
import Events from './components/events';
import Join from './components/join';
import User from './components/user';
import Footer from './components/footer';
import SignUp from './pages/signup';
import './index.scss';

export default function App() {
  const basePath = import.meta.env.BASE_URL || '/';
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else { localStorage.removeItem('user'); }
  }, [user]);

  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    console.log({ userFromStorage });
    if (userFromStorage) {
      console.log('found user in storage, set state');
      setUser(JSON.parse(userFromStorage));
    }
  }, []);

  return (
    <Router basename={basePath}>
      <div className="app">
        <Routes>
          <Route
            path="/signup/:eventId?"
            element={(
              <SignUp
                user={user}
              />
            )}
          />
          <Route
            path="/?"
            element={(
              <>
                <Hero />
                <div className="pages">
                  <About />
                  <Events />
                  <Join />
                </div>
                <Footer />
                <User
                  user={user}
                  setUser={setUser}
                />
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
