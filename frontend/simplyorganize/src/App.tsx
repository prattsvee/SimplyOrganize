import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// Import pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProjectBoard = React.lazy(() => import('./pages/ProjectBoard'));
const KanbanBoard = React.lazy(() => import('./pages/KanbanBoard'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Settings = React.lazy(() => import('./pages/Settings'));

const App = () => {
  return (
    <Router>
      <Suspense 
        fallback={
          <div className="flex h-screen items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:projectId" element={<ProjectBoard />} />
          <Route path="/project/:projectId/board" element={<KanbanBoard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;