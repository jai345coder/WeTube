import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import JoinRoomPage from './pages/JoinRoomPage';
import RoomShowcasePage from './pages/RoomShowcasePage';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [theme, setTheme] = useState('dark');
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Applies dark/light class to root document element
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
      <Routes>
        <Route
          path="/"
          element={
            <JoinRoomPage
              theme={theme}
              onToggleTheme={toggleTheme}
              username={username}
              setUsername={setUsername}
              roomId={roomId}
              setRoomId={setRoomId}
            />
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <RoomShowcasePage
              theme={theme}
              onToggleTheme={toggleTheme}
              username={username}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;