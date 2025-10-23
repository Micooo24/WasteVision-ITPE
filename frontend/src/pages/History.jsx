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
      
      // Check if response.data is an array or has a records property
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

          {loading ? (
            <div className="loading-message">Loading history...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : history.length === 0 ? (
            <div className="empty-message">
              <p>No classification history yet. Start classifying waste to see your history here.</p>
            </div>
          ) : (
            <div className="history-grid">
              {history.map((record) => (
                <div key={record._id} className="history-card">
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
                      <div className="history-details">
                        {record.items.map((item, index) => (
                          <div key={index} className="item-detail">
                            <p><strong>Item:</strong> {item.item}</p>
                            <p><strong>Type:</strong> {item.type}</p>
                            <p><strong>Confidence:</strong> {item.confidence}%</p>
                            <p>
                              <strong>Recyclable:</strong>{' '}
                              <span className={item.recyclable ? 'recyclable' : 'non-recyclable'}>
                                {item.recyclable ? 'Yes' : 'No'}
                              </span>
                            </p>
                            {item.disposalMethod && (
                              <p><strong>Disposal:</strong> {item.disposalMethod}</p>
                            )}
                            {item.description && (
                              <p><strong>Description:</strong> {item.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer className={isCollapsed ? 'collapsed' : ''} />
    </div>
  )
}

export default History