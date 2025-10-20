import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { apiService } from '../services/api'
import '../assets/css/dashboard.css'

function History() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await apiService.getHistory()
      setHistory(response.data)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
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
            <div className="loading">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <p>No classification history yet. Start by uploading waste images!</p>
            </div>
          ) : (
            <div className="history-grid">
              {history.map((item, index) => (
                <div key={index} className="history-card">
                  {item.image_url && (
                    <img src={item.image_url} alt="Waste" className="history-image" />
                  )}
                  <div className="history-details">
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Confidence:</strong> {item.confidence}%</p>
                    <p><strong>Recyclable:</strong> {item.recyclable ? 'Yes' : 'No'}</p>
                    <p className="history-date">{new Date(item.created_at).toLocaleString()}</p>
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