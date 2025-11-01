import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Snackbar from '../components/Snackbar'
import { apiService } from '../services/api'
import { getUser, saveUser } from '../services/auth'
import '../assets/css/profile.css'
import defaultAvatar from '../assets/img/OIP.jpg'

function Profile({ isAuthenticated, setIsAuthenticated }) {
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
        setSnackbar({
          isOpen: true,
          message: 'Please select an image file',
          type: 'error'
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        setSnackbar({
          isOpen: true,
          message: 'Image size should be less than 5MB',
          type: 'error'
        })
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

    // Password validation
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password')
        setSnackbar({
          isOpen: true,
          message: 'Current password is required to change password',
          type: 'error'
        })
        return
      }
      
      if (!formData.newPassword) {
        setError('New password is required')
        setSnackbar({
          isOpen: true,
          message: 'New password is required',
          type: 'error'
        })
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        setSnackbar({
          isOpen: true,
          message: 'New passwords do not match',
          type: 'error'
        })
        return
      }

      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        setSnackbar({
          isOpen: true,
          message: 'New password must be at least 6 characters',
          type: 'error'
        })
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
      
      // Update local storage with new user data
      saveUser(response.data.user)
      
      setSnackbar({
        isOpen: true,
        message: 'Profile updated successfully!',
        type: 'success'
      })
      
      // Reset form data
      setFormData({
        ...formData,
        avatar: response.data.user.avatar || formData.avatar,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setAvatarFile(null)
      setAvatarPreview(null)
      
      // Reload profile to get fresh data
      await fetchProfile()
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile'
      setError(errorMessage)
      setSnackbar({
        isOpen: true,
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const displayAvatar = avatarPreview || formData.avatar || defaultAvatar

  return (
    <div className="profile-container">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      
      {/* Hero Section */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>
      </section>

      {/* Profile Form Section */}
      <section className="profile-form-section">
        <div className="profile-form-wrapper">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="profile-form">
            {/* Avatar Section */}
            <div className="avatar-section">
              <div className="avatar-container">
                <img 
                  src={displayAvatar} 
                  alt="Profile Avatar" 
                  className="avatar-image"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
              </div>
              
              <label htmlFor="avatar-upload" className="avatar-upload-label">
                <i className="fas fa-camera"></i>
                Change Avatar
              </label>
              <input
                type="file"
                id="avatar-upload"
                className="avatar-upload-input"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {avatarPreview && (
                <small className="avatar-preview-text">
                  ✓ New avatar selected. Click "Update Profile" to save.
                </small>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="form-section">
              <h3>
                <i className="fas fa-user"></i>
                Personal Information
              </h3>
              
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
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  title="Email cannot be changed"
                />
                <small className="form-text">
                  <i className="fas fa-info-circle"></i> Email address cannot be changed
                </small>
              </div>
            </div>

            <hr className="form-divider" />

            {/* Change Password Section */}
            <div className="form-section">
              <h3>
                <i className="fas fa-lock"></i>
                Change Password
              </h3>
              <p className="form-description">
                Leave these fields blank if you don't want to change your password
              </p>

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
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Updating Profile...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Update Profile
                </>
              )}
            </button>
          </form>
        </div>
      </section>
      
      <Footer />
      
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