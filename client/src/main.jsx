// ============================================================================
//  main.jsx — נקודת הכניסה של אפליקציית React
// ============================================================================
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { GameProvider } from './state/GameContext.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* GameProvider מחזיק את החיבור לשרת ואת מצב החדר */}
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);