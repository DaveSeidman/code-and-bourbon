import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

import { getBackendUrl } from '../../utils';
import './index.scss';

export default function User({ user, setUser }) {
  const BACKEND_URL = getBackendUrl();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const firstLoginOptionRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/auth/user`, { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (!showLoginOptions) return undefined;

    const focusFrame = window.requestAnimationFrame(() => {
      firstLoginOptionRef.current?.focus();
    });
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowLoginOptions(false);
    };

    document.addEventListener('keydown', closeOnEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showLoginOptions]);

  const login = (provider) => {
    window.location.href = `${BACKEND_URL}/auth/${provider}?redirect=${encodeURIComponent(window.location.href)}`;
  };

  const logout = () => {
    axios
      .get(`${BACKEND_URL}/auth/logout`, { withCredentials: true })
      .then(() => {
        setUser(null);
      })
      .catch(() => {});
  };

  return (
    <div className="nav">
      {user ? (
        <div className="nav-user">
          <p>
            Welcome,&nbsp;
            {user?.displayName}
          </p>
          <img src={user?.profilePicture} alt="Profile" width="50" />
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={showLoginOptions}
            onClick={() => setShowLoginOptions(true)}
          >
            Login
          </button>
          {showLoginOptions && (
            <div className="nav-login-backdrop">
              <button
                type="button"
                className="nav-login-scrim"
                aria-label="Close login options"
                onClick={() => setShowLoginOptions(false)}
              />
              <div
                className="nav-login"
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-title"
              >
                <button
                  type="button"
                  className="nav-login-close"
                  aria-label="Close login options"
                  onClick={() => setShowLoginOptions(false)}
                >
                  &times;
                </button>
                <h2 id="login-title">Sign in</h2>
                <p>Choose a provider to continue.</p>
                <div className="nav-login-actions">
                  <button
                    ref={firstLoginOptionRef}
                    type="button"
                    onClick={() => login('github')}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 .7A11.5 11.5 0 0 0 8.4 23c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C16 4.7 17 5 17 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.8 5.4-5.5 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 12 .7Z" />
                    </svg>
                    Continue with GitHub
                  </button>
                  <button type="button" onClick={() => login('google')}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285f4"
                        d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4h5.4a4.7 4.7 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"
                      />
                      <path
                        fill="#34a853"
                        d="M12 22c2.7 0 5-.9 6.7-2.4L15.4 17c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10.1 10.1 0 0 0 12 22Z"
                      />
                      <path
                        fill="#fbbc05"
                        d="M6.5 13.9A6 6 0 0 1 6.2 12c0-.7.1-1.3.3-1.9V7.4H3.1A10 10 0 0 0 2 12c0 1.7.4 3.2 1.1 4.6l3.4-2.7Z"
                      />
                      <path
                        fill="#ea4335"
                        d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10.1 10.1 0 0 0-8.9 5.4l3.4 2.7A5.9 5.9 0 0 1 12 6Z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
