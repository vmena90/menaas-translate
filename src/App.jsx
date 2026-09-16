import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import SettingsPage from './pages/SettingsPage';
import RecordingDetailPage from './pages/RecordingDetailPage';
import LoginPage from './pages/LoginPage';

const AuthGuard = ({ children }) => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/subject/:id" element={<AuthGuard><SubjectPage /></AuthGuard>} />
      <Route path="/recording/:id" element={<AuthGuard><RecordingDetailPage /></AuthGuard>} />
      <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
