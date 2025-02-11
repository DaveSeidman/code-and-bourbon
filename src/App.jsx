import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Hero from './components/hero';
import Events from './components/events';
import './index.scss';

export default function App() {
  const basePath = import.meta.env.BASE_URL || '/';
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/auth/user', { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      });

    // Listen for login event from popup
    window.addEventListener('message', (event) => {
      if (event.origin !== 'http://localhost:3000') return; // Adjust for production
      if (event.data?.type === 'oauth-success') {
        setUser(event.data.user);
      }
    });
  }, []);

  const openLoginPopup = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const loginWindow = window.open(
      'http://localhost:3000/auth/google',
      'Google Login',
      `width=${width},height=${height},top=${top},left=${left}`,
    );

    // Poll the window state and listen for completion
    const interval = setInterval(() => {
      if (!loginWindow || loginWindow.closed) {
        clearInterval(interval);
        axios.get('http://localhost:3000/auth/user', { withCredentials: true })
          .then((response) => setUser(response.data))
          .catch(() => setUser(null));
      }
    }, 1000);
  };

  const handleLogout = () => {
    axios.get('http://localhost:3000/auth/logout', { withCredentials: true })
      .then(() => {
        setUser(null);
      })
      .catch((err) => {
        console.error('Logout failed', err);
      });
  };

  return (
    <Router basename={basePath}>
      <Routes>
        <Route
          path="/:page?"
          element={(
            <div className="app">
              <Hero />
              <div className="pages">
                <div className="pages-page who">
                  <h1>WhoWeAre</h1>
                  <p>We are a group of like-minded individuals, mostly in NYC, that are reclaiming the post-work happy hour we lost during the pandemic. Most of us enjoy Bourbon but it's not at all a requirement, but more of a suggestion that our meetups encourage a relaxed environment where natural creativity and networking opportunities.</p>
                </div>
                <Events />
                <div className="pages-page join">
                  <h1>OneOfUsOneOfUs</h1>
                  <p>Join us by setting up a profile here: link</p>
                  <p>You'll receive information about how to join us in person at the next meetup!</p>
                </div>
              </div>
              <div className="login">
                {user ? (
                  <div>
                    <p>
                      Welcome,
                      {user.displayName}
                    </p>
                    <img src={user.profilePicture} alt="Profile" width="50" />
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                ) : (
                  <button onClick={openLoginPopup}>Login with Google</button>
                )}
              </div>
            </div>
          )}
        />
      </Routes>
    </Router>
  );
}
