import { useEffect } from 'react'
import '../assets/css/components.css'

function Snackbar({ message, type = 'success', isOpen, onClose, duration = 3000 }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose, duration])

  if (!isOpen) return null

  return (
    <div className={`snackbar ${type} ${isOpen ? 'show' : ''}`}>
      <span className="snackbar-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span className="snackbar-message">{message}</span>
      <button className="snackbar-close" onClick={onClose}>
        ×
      </button>
    </div>
  )
}

export default Snackbar