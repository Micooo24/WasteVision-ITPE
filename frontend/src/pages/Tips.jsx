import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { apiService } from '../services/api'
import '../assets/css/dashboard.css'

function Tips({ isAuthenticated, setIsAuthenticated }) {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTips()
  }, [])

  const fetchTips = async () => {
    try {
      const response = await apiService.getTips()
      setTips(response.data)
    } catch (error) {
      console.error('Error fetching tips:', error)
      // Fallback tips if API fails
      setTips([
        {
          title: 'Reduce Plastic Usage',
          description: 'Use reusable bags and containers to minimize plastic waste.',
          category: 'Reduce'
        },
        {
          title: 'Proper Recycling',
          description: 'Clean and separate recyclables before disposal.',
          category: 'Recycle'
        },
        {
          title: 'Composting',
          description: 'Compost organic waste to create nutrient-rich soil.',
          category: 'Reuse'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className="main-content">
        <main className={`content no-sidebar`}>
          <div className="dashboard-header">
            <h2>Waste Management Tips</h2>
          </div>

          {loading ? (
            <div className="loading">Loading tips...</div>
          ) : (
            <div className="tips-grid">
              {tips.map((tip, index) => (
                <div key={index} className="tip-card">
                  <h3>{tip.title}</h3>
                  <span className="tip-category">{tip.category}</span>
                  <p>{tip.description}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Tips