import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
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
                <img className="header-logo" src={logo} />
              </div>
            </div>
          )}
        />
      </Routes>
    </Router>
  );
}
