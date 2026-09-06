import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import JoinRoomPage from './pages/JoinRoomPage';
import RoomShowcasePage from './pages/RoomShowcasePage';

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  return (
    <div className={theme === 'dark' ? 'dark' : 'light'}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<JoinRoomPage theme={theme} onToggleTheme={toggleTheme} />}
          />
          <Route
            path="/room/:roomId"
            element={<RoomShowcasePage theme={theme} onToggleTheme={toggleTheme} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
