import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import SettingsPage from './pages/SettingsPage';
import RecordingDetailPage from './pages/RecordingDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/subject/:id" element={<SubjectPage />} />
      <Route path="/recording/:id" element={<RecordingDetailPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
