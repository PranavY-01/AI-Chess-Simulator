import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiCompanion from './AiCompanion';
import ChessBackground from './ChessBackground';
import './AppLayout.css';

const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <ChessBackground />
      <Sidebar />
      <main className="app-content">
        <Outlet />
      </main>
      <AiCompanion />
    </div>
  );
};

export default AppLayout;

