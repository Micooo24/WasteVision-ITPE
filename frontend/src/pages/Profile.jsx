import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Snackbar from '../components/Snackbar'
import { apiService } from '../services/api'
import { getUser, saveUser } from '../services/auth'
import '../assets/css/dashboard.css'
import defaultAvatar from '../assets/img/OIP.jpg'

function Profile({ isAuthenticated, setIsAuthenticated }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiService.getProfile()
      const user = response.data.user
      
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
      const localUser = getUser()
      if (localUser) {
        setFormData({
          ...formData,
          name: localUser.name || '',
          email: localUser.email || '',
          avatar: localUser.avatar || ''
        })
      }
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password')
        return
      }
      
      if (!formData.newPassword) {
        setError('New password is required')
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        return
      }

      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }
    }

    setLoading(true)

    try {
      const updateData = new FormData()
      updateData.append('name', formData.name)

      if (avatarFile) {
        updateData.append('avatar', avatarFile)
      }

      if (formData.newPassword) {
        updateData.append('currentPassword', formData.currentPassword)
        updateData.append('newPassword', formData.newPassword)
      }

      const response = await apiService.updateProfile(updateData)
      saveUser(response.data.user)
      
      setSnackbar({
        isOpen: true,
        message: 'Profile updated successfully!',
        type: 'success'
      })
      
      setFormData({
        ...formData,
        avatar: response.data.user.avatar || formData.avatar,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const displayAvatar = avatarPreview || formData.avatar || defaultAvatar

  return (
    <div className="app-container">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className="main-content">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <main className={`content ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="dashboard-header">
            <h2>Profile Settings</h2>
          </div>

          <div className="profile-section">
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="profile-form">
              {/* Avatar Display Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1rem' }}>
                  <img 
                    src={displayAvatar} 
                    alt="Profile Avatar" 
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid #4caf50',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      e.target.src = defaultAvatar;
                    }}
                  />
                </div>
                
                <label htmlFor="avatar-upload" style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}>
                  Change Avatar
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                {avatarPreview && (
                  <small style={{ marginTop: '0.5rem', color: '#666' }}>
                    New avatar selected. Click "Update Profile" to save.
                  </small>
                )}
              </div>

              <h3>Personal Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="input-disabled"
                  title="Email cannot be changed"
                />
                <small className="form-text">Email address cannot be changed</small>
              </div>

              <hr />

              <h3>Change Password</h3>
              <p className="form-description">Leave blank if you don't want to change your password</p>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  minLength="6"
                />
              </div>

              <hr />

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </main>
      </div>
      
      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
      />
    </div>
  )
}

export default Profile