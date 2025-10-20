import { NavLink } from 'react-router-dom'
import '../assets/css/components.css'

function Sidebar({ isCollapsed, toggleSidebar }) {
  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink 
            to="/home" 
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            title="Home"
          >
            <span className="icon">🏠</span>
            <span>Home</span>
          </NavLink>
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
          <NavLink 
            to="/tips" 
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            title="Tips"
          >
            <span className="icon">💡</span>
            <span>Tips</span>
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            title="Profile"
          >
            <span className="icon">👤</span>
            <span>Profile</span>
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
  )
}

export default Sidebar