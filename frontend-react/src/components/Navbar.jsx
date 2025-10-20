import { Link } from 'react-router-dom'
import { logout, getUser } from '../services/auth'
import '../assets/css/components.css'

function Navbar() {
  const user = getUser()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
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
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar