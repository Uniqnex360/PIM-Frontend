import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Unauthorized from './Unauthorized';
import AdminHomePage from './components/adminFlow/HomePage'; 
import SuperAdminHomePage from './components/superAdminFlow/HomePage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<Login />} />
                <Route path="*" element={<Navigate to="" />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Redirect any other paths to the login page */}
        <Route path="/Admin/*" element={<AdminHomePage />} />
        <Route path="/SuperAdmin/*" element={<SuperAdminHomePage />} />
      </Routes>
    </Router>
  );
}
export default App;