import axios from 'axios';
import React, { useEffect, useState } from 'react';

import './index.scss';

export default function User({ user, setUser }) {
  const BACKEND_URL = 'https://api.codeandbourbon.com';

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

  const login = () => {
    window.location.href = `${BACKEND_URL}/auth/google?redirect=${encodeURIComponent(window.location.href)}`;
  };

  const logout = () => {
    axios
      .get(`${BACKEND_URL}/auth/logout`, { withCredentials: true })
      .then(() => {
        setUser(null);
      })
      .catch((err) => {
        console.error('Logout failed', err);
      });
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
        <button type="button" onClick={login}>
          Login
        </button>
      )}
    </div>
  );
}
