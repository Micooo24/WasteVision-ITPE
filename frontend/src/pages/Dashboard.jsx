import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { apiService } from '../services/api'
import '../assets/css/dashboard.css'

function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statistics, setStatistics] = useState(null)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await apiService.getStatistics()
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // TODO: Integrate with ML service at http://localhost:5000/identify
      // For now using mock classification
      const mockClassification = {
        wasteType: 'Plastic Bottle',
        category: 'Recyclable',
        confidence: 95,
        recyclable: true,
        disposalMethod: 'Place in blue recycling bin',
        description: 'PET plastic bottle - can be recycled'
      };
      
      // Save the record using the API
      const response = await apiService.classifyWaste(
        selectedFile,
        mockClassification
      );
      
      // Set result from backend response
      setResult({
        category: response.data.category,
        confidence: response.data.confidence,
        recyclable: response.data.recyclable,
        disposal_instructions: response.data.disposal_instructions
      });
      
      // Clear form
      setSelectedFile(null);
      setPreview(null);
      
      // Refresh statistics
      fetchStatistics();
      
    } catch (err) {
      console.error('Error classifying waste:', err);
      setError(err.response?.data?.error || 'Failed to classify waste. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <main className={`content ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="dashboard-header">
            <h2>Waste Classification Dashboard</h2>
          </div>

          {statistics && (
            <div className="statistics-grid">
              <div className="stat-card">
                <h3>Total Classifications</h3>
                <p className="stat-number">{statistics.totalClassifications || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Recyclable Items</h3>
                <p className="stat-number">{statistics.recyclable || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Non-Recyclable Items</h3>
                <p className="stat-number">{statistics.nonRecyclable || 0}</p>
              </div>
            </div>
          )}

          <div className="upload-section">
            <h3>Upload Waste Image</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="file-input-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="file-input"
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                  Choose Image
                </label>
              </div>

              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!selectedFile || loading}
              >
                {loading ? 'Classifying...' : 'Classify Waste'}
              </button>
            </form>
          </div>

          {result && (
            <div className="result-section">
              <h3>Classification Result</h3>
              <div className="result-card">
                <p><strong>Category:</strong> {result.category}</p>
                <p><strong>Confidence:</strong> {result.confidence}%</p>
                <p><strong>Recyclable:</strong> {result.recyclable ? 'Yes' : 'No'}</p>
                {result.disposal_instructions && (
                  <p><strong>Disposal Instructions:</strong> {result.disposal_instructions}</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
       <Footer className={isCollapsed ? 'collapsed' : ''} />
    </div>
  )
}

export default Dashboard