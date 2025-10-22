import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout, getUser } from '../services/auth'
import '../assets/css/components.css'
import LogoutModal from './LogoutModal'

function Navbar() {
  const user = getUser()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    logout()
    setShowLogoutModal(false)
    navigate('/login')
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-brand">
          <span className="navbar-logo">♻️</span>
          <h1>WasteVision</h1>
        </Link>
        <div className="navbar-menu">
          {user && (
            <>
              <span className="navbar-user">
                {user?.name || 'User'}
              </span>
              <button onClick={handleLogoutClick} className="btn btn-logout">
                Logout
              </button>

              <LogoutModal 
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar