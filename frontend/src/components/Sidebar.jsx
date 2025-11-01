import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/css/sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            title="Dashboard"
          >
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/history" 
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            title="History"
          >
            <span className="icon">📜</span>
            <span>History</span>
          </NavLink>
        </nav>
      </aside>
      
      <button 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? '›' : '‹'}
      </button>
    </>
  );
};

export default Sidebar;