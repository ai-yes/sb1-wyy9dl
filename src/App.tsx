import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import GamePage from './pages/GamePage';
import InventoryPage from './pages/InventoryPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </GameProvider>
  );
}