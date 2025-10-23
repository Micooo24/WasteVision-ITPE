import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
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
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  // Public routes - redirects to dashboard if already logged in
  const PublicRoute = ({ children }) => {
    return isAuthenticated ? <Navigate to="/dashboard" /> : children
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
            padding: '12px 20px',
          },
          // Success
          success: {
            duration: 3000,
            style: {
              background: '#4caf50',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#4caf50',
            },
          },
          // Error
          error: {
            duration: 4000,
            style: {
              background: '#f44336',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#f44336',
            },
          },
          // Loading
          loading: {
            style: {
              background: '#2196f3',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#2196f3',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
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
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute>
            <History />
          </PrivateRoute>
        } />
        <Route path="/tips" element={
          <PrivateRoute>
            <Tips />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App