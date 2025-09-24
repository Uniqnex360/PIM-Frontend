import React, { useState } from 'react';
import { useParams, Routes, Route, useNavigate  } from 'react-router-dom';
import './HomePage.css';
import Sidebar from './sidebar/Sidebar.js';
import Header from '../Header/Header.js';
import Footer from '../Footer/Footer.js';
import Dashboard from './dashboard/Dashboard';
import User from './user/User.js';
import AddClientUser from './user/AddClientUser.js';
import UpdateClientUser from './user/UpdateClientUser.js';

function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const handleNavigate = (path) => {
    // Update the key to force a re-render
    navigate(path);
  };
  return (
    <div className="home-container">
      <Header toggleSidebar={toggleSidebar}  />
      <div className="main-container">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} handleNavigate={handleNavigate} />
        <div className={`right-container ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
          <Routes>
            <Route path="/" element={<Dashboard isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="users" element={<User isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="addClientUser" element={<AddClientUser isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            <Route path="updateClientUser/:userId" element={<UpdateClientUser isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
