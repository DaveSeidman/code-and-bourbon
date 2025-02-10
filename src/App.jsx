import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import './index.scss';

export default function App() {
  const basePath = import.meta.env.BASE_URL || '/';

  return (
    <Router basename={basePath}>
      <Routes>
        <Route
          path="/:page?"
          element={
            <div className="app">
              <h1>🥃 Code & Bourbon</h1>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
