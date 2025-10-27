import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { apiService } from '../services/api'
import '../assets/css/dashboard.css'
import toast from 'react-hot-toast'

function History() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await apiService.getHistory()
      
      const records = Array.isArray(response.data) 
        ? response.data 
        : response.data.records || []
      
      setHistory(records)
      setError('')
    } catch (err) {
      toast.error('Error fetching history: ' + (err.message || 'Unknown error'))
      setError('Failed to load history. Please try again.')
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (recordId) => {
    try {
      const response = await apiService.getRecordById(recordId)
      setSelectedRecord(response.data.record)
      setShowModal(true)
    } catch (err) {
      console.error('Error fetching record details:', err)
      alert('Failed to load record details')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRecord(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <main className={`content ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="dashboard-header">
            <h2>Classification History</h2>
          </div>

          {loading && (
            <div className="loading-message">Loading history...</div>
          )}

          {error && (
            <div className="error-message">{error}</div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="empty-state">
              <p>No classification history yet.</p>
              <p>Start by uploading an image in the Dashboard!</p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="history-grid">
              {history.map((record) => (
                <div 
                  key={record._id} 
                  className="history-card"
                  onClick={() => handleViewDetails(record._id)}
                  style={{ cursor: 'pointer' }}
                >
                  {record.image && (
                    <div className="history-image">
                      <img src={record.image.url} alt="Classified waste" />
                    </div>
                  )}
                  <div className="history-content">
                    <div className="history-date">
                      {formatDate(record.createdAt)}
                    </div>
                    {record.items && record.items.length > 0 && (
                      <div className="history-summary">
                        <p><strong>{record.items[0].item}</strong></p>
                        <span className={`type-badge ${record.items[0].type?.toLowerCase()}`}>
                          {record.items[0].type}
                        </span>
                        <p className="confidence-text">
                          Confidence: {Math.round(record.items[0].confidence * 100)}%
                        </p>
                      </div>
                    )}
                    <button className="btn-view-details">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer className={isCollapsed ? 'collapsed' : ''} />

      {/* Details Modal */}
      {showModal && selectedRecord && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Classification Details</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body-large">
              <div className="detail-images">
                <div className="detail-image-section">
                  <h4>Original Image</h4>
                  <img src={selectedRecord.image.url} alt="Original" className="detail-img" />
                </div>
                {selectedRecord.detectedImage && (
                  <div className="detail-image-section">
                    <h4>Detected Image (with bounding boxes)</h4>
                    <img src={selectedRecord.detectedImage.url} alt="Detected" className="detail-img" />
                  </div>
                )}
              </div>
              
              <div className="detail-info">
                <h4>Classification Information</h4>
                <div className="detail-date">
                  <strong>Date:</strong> {formatDate(selectedRecord.createdAt)}
                </div>
                
                {selectedRecord.items && selectedRecord.items.map((item, index) => (
                  <div key={index} className="detail-item">
                    <div className="detail-row">
                      <strong>Item:</strong> {item.item}
                    </div>
                    <div className="detail-row">
                      <strong>Type:</strong> 
                      <span className={`type-badge ${item.type?.toLowerCase()}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Confidence:</strong> {Math.round(item.confidence * 100)}%
                    </div>
                    <div className="detail-row">
                      <strong>Recyclable:</strong> 
                      <span className={item.recyclable ? 'recyclable-yes' : 'recyclable-no'}>
                        {item.recyclable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {item.disposalMethod && (
                      <div className="detail-row disposal-method">
                        <strong>Disposal Method:</strong>
                        <p>{item.disposalMethod}</p>
                      </div>
                    )}
                    {item.description && (
                      <div className="detail-row">
                        <strong>Description:</strong> {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History