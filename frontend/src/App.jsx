import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Tips from './pages/Tips'
import Profile from './pages/Profile'
import { checkAuth } from './services/auth'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth()
      setIsAuthenticated(authenticated)
      setLoading(false)
    }
    verifyAuth()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  // Protected routes - requires authentication
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />
  }

  // Public routes - redirects to dashboard if already logged in
  const PublicRoute = ({ children }) => {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/about" element={<About isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login setIsAuthenticated={setIsAuthenticated} />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          </PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute>
            <History isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          </PrivateRoute>
        } />
        <Route path="/tips" element={
          <PrivateRoute>
            <Tips isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App