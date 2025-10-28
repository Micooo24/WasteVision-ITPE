import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LogoutModal from './LogoutModal';
import { getUser, getToken, removeToken } from '../services/auth';
import '../assets/css/navbar.css';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Update user info when auth state or route changes
    const user = getUser();
    setUserName(user?.name || 'User');
  }, [isAuthenticated, location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    removeToken(); // Use the auth service helper
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
    navigate('/login', { replace: true });
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-eco">Waste</span>
            <span className="logo-bin">Vision</span>
            <div className="logo-squares">
              <span className="square orange"></span>
              <span className="square green"></span>
              <span className="square blue"></span>
            </div>
          </Link>

          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            {isAuthenticated && (
              <li><Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></li>
            )}
            <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
            <li><Link to="/tips" onClick={() => setIsMenuOpen(false)}>Blog</Link></li>
          </ul>

          {isAuthenticated ? (
            <div className="navbar-cta navbar-user-section">
              <span className="navbar-username">{userName}</span>
              <button 
                className="navbar-logout-btn" 
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                ×
              </button>
            </div>
          ) : (
            <button className="navbar-cta" onClick={handleLoginClick}>
              Log In
            </button>
          )}
        </div>
      </nav>

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};

export default Navbar;