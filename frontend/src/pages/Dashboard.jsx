import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
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
  const [statistics, setStatistics] = useState(null)
  const [detectedImages, setDetectedImages] = useState({ custom: null, default: null })
  const [allDetections, setAllDetections] = useState([])
  const [activeModel, setActiveModel] = useState('custom')

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
      toast.error('Failed to fetch statistics')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setResult(null)
      setDetectedImages({ custom: null, default: null })
      setAllDetections([])
      toast.success('Image selected successfully')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setDetectedImages({ custom: null, default: null });
    setAllDetections([]);
    
    const loadingToast = toast.loading('Classifying waste...');
    
    try {
      const response = await apiService.classifyWaste(selectedFile);
      
      const classification = response.data.classification || response.data;
      
      // confidence is already in percentage (0-100) from API service
      setResult({
        category: classification.category,
        confidence: classification.confidence, // Already percentage
        recyclable: classification.recyclable,
        disposal_instructions: classification.disposalMethod,
        wasteType: classification.wasteType,
        description: classification.description
      });

      if (response.data.customModel || response.data.defaultModel) {
        setDetectedImages({
          custom: response.data.customModel?.image || null,
          default: response.data.defaultModel?.image || null
        });
      }

      if (response.data.allDetections) {
        setAllDetections(response.data.allDetections);
      }
      
      // Refresh statistics
      fetchStatistics();
      
      toast.success('Waste classified and saved successfully!', {
        id: loadingToast,
        duration: 4000,
      });
      
    } catch (err) {
      console.error('Error classifying waste:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error ||
                          err.message || 
                          'Failed to classify waste. Please ensure ML service is running.';
      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      });
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
                {selectedFile && <span className="file-name">{selectedFile.name}</span>}
              </div>

              {preview && !detectedImages.custom && !detectedImages.default && (
                <div className="image-preview">
                  <h4>Original Image</h4>
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

          {(detectedImages.custom || detectedImages.default) && (
            <div className="detected-images-section">
              <h3>Detection Results</h3>
              
              <div className="model-tabs">
                <button 
                  className={`tab-btn ${activeModel === 'custom' ? 'active' : ''}`}
                  onClick={() => setActiveModel('custom')}
                  disabled={!detectedImages.custom}
                >
                  Custom Model (trained-v2.pt)
                </button>
                <button 
                  className={`tab-btn ${activeModel === 'default' ? 'active' : ''}`}
                  onClick={() => setActiveModel('default')}
                  disabled={!detectedImages.default}
                >
                  Default Model (yolov5s.pt)
                </button>
              </div>

              <div className="detected-image-container">
                {activeModel === 'custom' && detectedImages.custom && (
                  <img 
                    src={detectedImages.custom} 
                    alt="Detected waste with bounding boxes (Custom Model)" 
                    className="detected-image"
                  />
                )}
                {activeModel === 'default' && detectedImages.default && (
                  <img 
                    src={detectedImages.default} 
                    alt="Detected waste with bounding boxes (Default Model)" 
                    className="detected-image"
                  />
                )}
              </div>
            </div>
          )}

          {allDetections.length > 0 && (
            <div className="all-detections-section">
              <h3>All Detected Items</h3>
              <div className="detections-grid">
                {allDetections.map((detection, index) => (
                  <div key={index} className="detection-card">
                    <div className="detection-header">
                      <span className="detection-item">{detection.item}</span>
                      <span className={`detection-type ${detection.type?.toLowerCase()}`}>
                        {detection.type}
                      </span>
                    </div>
                    <div className="detection-confidence">
                      Confidence: {(detection.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${detection.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="result-section">
              <h3>Primary Classification Result</h3>
              <div className="result-card">
                <p><strong>Waste Type:</strong> {result.wasteType}</p>
                <p><strong>Category:</strong> <span className={`category-badge ${result.category?.toLowerCase()}`}>{result.category}</span></p>
                <p><strong>Confidence:</strong> {result.confidence}%</p>
                <p><strong>Recyclable:</strong> <span className={result.recyclable ? 'recyclable-yes' : 'recyclable-no'}>{result.recyclable ? 'Yes' : 'No'}</span></p>
                {result.disposal_instructions && (
                  <div className="disposal-instructions">
                    <strong>Disposal Instructions:</strong>
                    <p>{result.disposal_instructions}</p>
                  </div>
                )}
                {result.description && (
                  <p className="description"><strong>Description:</strong> {result.description}</p>
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