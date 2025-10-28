import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'
import '../assets/css/dashboard.css'
import { exportHistoryToPDF } from '../services/pdfExport';

function History({ isAuthenticated, setIsAuthenticated }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false);

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
      console.error('Error fetching history:', err)
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
      toast.error('Failed to load record details')
    }
  }

  const handleDeleteClick = (e, record) => {
    e.stopPropagation() // Prevent triggering view details
    setRecordToDelete(record)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!recordToDelete) return

    try {
      setDeleting(true)
      await apiService.deleteRecord(recordToDelete._id)
      
      // Remove from local state
      setHistory(history.filter(record => record._id !== recordToDelete._id))
      
      toast.success('Record deleted successfully')
      setShowDeleteModal(false)
      setRecordToDelete(null)
    } catch (err) {
      console.error('Error deleting record:', err)
      toast.error('Failed to delete record. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setRecordToDelete(null)
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

  const handleExportPDF = async () => {
    if (history.length === 0) {
      toast.error('No classification history to export');
      return;
    }

    setExportingPDF(true);
    const loadingToast = toast.loading('🔄 Generating PDF report...');

    try {
      // Get user info from localStorage or API
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      
      const result = await exportHistoryToPDF(history, userInfo);
      
      if (result.success) {
        toast.success(`📄 PDF exported successfully: ${result.fileName}`, {
          id: loadingToast,
          duration: 4000
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.', {
        id: loadingToast,
        duration: 5000
      });
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
      <div className="main-content">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

        <main className={`content ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="dashboard-header">
            <h2>Classification History</h2>
            {history.length > 0 && (
              <button 
                className="btn-export-pdf"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: exportingPDF ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginLeft: 'auto'
                }}
              >
                {exportingPDF ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-pdf"></i>
                    Export to PDF
                  </>
                )}
              </button>
            )}
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
                    <div className="history-actions">
                      <button 
                        className="btn-view-details"
                        onClick={() => handleViewDetails(record._id)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={(e) => handleDeleteClick(e, record)}
                        title="Delete record"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recordToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this record?</p>
              {recordToDelete.items && recordToDelete.items.length > 0 && (
                <div className="delete-preview">
                  <strong>{recordToDelete.items[0].item}</strong>
                  <p className="delete-date">{formatDate(recordToDelete.createdAt)}</p>
                </div>
              )}
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History