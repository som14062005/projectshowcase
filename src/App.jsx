import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PortfolioPage from "./page/PortfolioPage";
import AdminDashboard from "./page/AdminDashboard";
import AdminLogin from "./page/AdminLogin";
import EditProjectPage from "./page/EditProjectPage";
import ProjectDetailPage from './page/ProjectDetailPage';
import AdminProtectedRoute from "./components/AdminProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/" element={<AdminLogin />} />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/project/:projectId/edit"
          element={
            <AdminProtectedRoute>
              <EditProjectPage />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;