import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./src/Pages/Dashboard/dashboard";
import ProjectDetails from "./src/Pages/projectdetails";
import TaskDetails from "./src/Pages/taskdetails";
import Settings from "./src/Pages/settings";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<ProjectDetails />} />
        <Route path="/task/:taskId" element={<TaskDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
