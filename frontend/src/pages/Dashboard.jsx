import { useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Camera from './Camera'
import { apiService } from '../services/api'
import '../assets/css/dashboard.css'

function Dashboard({ isAuthenticated, setIsAuthenticated }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detectedImages, setDetectedImages] = useState({ custom: null, default: null })
  const [allDetections, setAllDetections] = useState([])
  const [activeModel, setActiveModel] = useState('custom')
  const [captureMode, setCaptureMode] = useState('upload') // 'upload' or 'camera'
  const [capturedImage, setCapturedImage] = useState(null)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Handle Camera Capture
  const handleCameraCapture = (file, imageUrl) => {
    setCapturedImage(imageUrl)
    setSelectedFile(file)
    setPreview(imageUrl)
    
    setResult(null)
    setDetectedImages({ custom: null, default: null })
    setAllDetections([])
  }

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        setCapturedImage(null)
      }
      reader.readAsDataURL(file)
      
      setResult(null)
      setDetectedImages({ custom: null, default: null })
      setAllDetections([])
      toast.success('Image selected successfully')
    }
  }

  // Handle Submit/Classify
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    if (!selectedFile) {
      toast.error('Please select or capture an image')
      return
    }
    
    setLoading(true)
    setResult(null)
    setDetectedImages({ custom: null, default: null })
    setAllDetections([])
    
    const loadingToast = toast.loading('🔍 Analyzing waste with AI models...')
    
    try {
      const response = await apiService.classifyWaste(selectedFile)
      const classification = response.data.classification || response.data
      
      setResult({
        category: classification.category,
        confidence: classification.confidence,
        recyclable: classification.recyclable,
        disposal_instructions: classification.disposalMethod,
        wasteType: classification.wasteType,
        description: classification.description
      })

      if (response.data.customModel || response.data.defaultModel) {
        setDetectedImages({
          custom: response.data.customModel?.image || null,
          default: response.data.defaultModel?.image || null
        })
      }

      if (response.data.allDetections && response.data.allDetections.length > 0) {
        setAllDetections(response.data.allDetections)
      }
      
      toast.success('✅ Waste classified successfully!', {
        id: loadingToast,
        duration: 4000,
      })
      
    } catch (err) {
      console.error('Error classifying waste:', err)
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error ||
                          err.message || 
                          'Failed to classify waste. Please ensure ML service is running on port 5000.'
      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset
  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setCapturedImage(null)
    setResult(null)
    setDetectedImages({ custom: null, default: null })
    setAllDetections([])
    setActiveModel('custom')
    toast.success('Reset complete')
  }

  // Switch capture mode
  const switchMode = (mode) => {
    setCaptureMode(mode)
    handleReset()
    toast.success(`Switched to ${mode === 'upload' ? 'Upload' : 'Camera'} mode`)
  }

  return (
    <div className="app-container">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className="main-content">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <main className={`content ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="dashboard-header">
            <h2>🗑️ Waste Classification Dashboard</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Upload an image or use your camera to classify waste with AI
            </p>
          </div>

          {/* Mode Selector */}
          <div className="upload-section">
            <div className="model-tabs" style={{ marginBottom: '1.5rem' }}>
              <button 
                className={`tab-btn ${captureMode === 'upload' ? 'active' : ''}`}
                onClick={() => switchMode('upload')}
                disabled={loading}
              >
                📁 Upload Image
              </button>
              <button 
                className={`tab-btn ${captureMode === 'camera' ? 'active' : ''}`}
                onClick={() => switchMode('camera')}
                disabled={loading}
              >
                📷 Use Camera
              </button>
            </div>

            {/* Upload Mode */}
            {captureMode === 'upload' && (
              <>
                <h3>Upload Waste Image</h3>
                <form onSubmit={handleSubmit}>
                  <div className="file-input-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="file-input"
                      className="file-input"
                      disabled={loading}
                    />
                    <label htmlFor="file-input" className="file-label">
                      Choose Image
                    </label>
                    {selectedFile && <span className="file-name">📄 {selectedFile.name}</span>}
                  </div>

                  {preview && !result && (
                    <div className="image-preview">
                      <h4>📸 Preview</h4>
                      <img src={preview} alt="Preview" />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={!selectedFile || loading}
                      style={{ flex: 1 }}
                    >
                      {loading ? '🔄 Classifying...' : '🔍 Classify Waste'}
                    </button>
                    {selectedFile && (
                      <button 
                        type="button"
                        onClick={handleReset}
                        className="btn"
                        style={{ flex: 1 }}
                        disabled={loading}
                      >
                        🔄 Reset
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

            {/* Camera Mode */}
            {captureMode === 'camera' && !capturedImage && (
              <Camera 
                onCapture={handleCameraCapture}
                isActive={captureMode === 'camera'}
                onClose={() => switchMode('upload')}
              />
            )}

            {/* Captured Image Preview */}
            {captureMode === 'camera' && capturedImage && (
              <>
                <h3>📸 Captured Image</h3>
                <div className="image-preview">
                  <img src={capturedImage} alt="Captured waste" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '480px', margin: '0 auto' }}>
                  {!result && (
                    <>
                      <button 
                        onClick={handleSubmit}
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        {loading ? '🔄 Classifying...' : '🔍 Classify Waste'}
                      </button>
                      <button 
                        onClick={() => {
                          setCapturedImage(null)
                          setSelectedFile(null)
                          setPreview(null)
                        }}
                        className="btn"
                        style={{ flex: 1 }}
                        disabled={loading}
                      >
                        🔄 Retake Photo
                      </button>
                    </>
                  )}
                  {result && (
                    <button 
                      onClick={handleReset}
                      className="btn"
                      style={{ flex: 1, backgroundColor: '#4CAF50', color: 'white' }}
                    >
                      ✨ New Classification
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Detection Results with Bounding Boxes */}
          {(detectedImages.custom || detectedImages.default) && (
            <div className="detected-images-section">
              <h3>🎯 AI Detection Results</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Compare results from both AI models
              </p>
              
              <div className="model-tabs">
                <button 
                  className={`tab-btn ${activeModel === 'custom' ? 'active' : ''}`}
                  onClick={() => setActiveModel('custom')}
                  disabled={!detectedImages.custom}
                >
                  🤖 Custom Model
                  {detectedImages.custom && <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>✅</span>}
                </button>
                <button 
                  className={`tab-btn ${activeModel === 'default' ? 'active' : ''}`}
                  onClick={() => setActiveModel('default')}
                  disabled={!detectedImages.default}
                >
                  🔍 YOLOv5 Model
                  {detectedImages.default && <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>✅</span>}
                </button>
              </div>

              <div className="detected-image-container">
                {activeModel === 'custom' && detectedImages.custom && (
                  <div>
                    <h4 style={{ textAlign: 'center', color: '#4CAF50', marginBottom: '1rem' }}>
                      Custom Trained Model Results
                    </h4>
                    <img 
                      src={detectedImages.custom} 
                      alt="Detected waste with bounding boxes (Custom Model)" 
                      className="detected-image"
                    />
                  </div>
                )}
                {activeModel === 'default' && detectedImages.default && (
                  <div>
                    <h4 style={{ textAlign: 'center', color: '#2196F3', marginBottom: '1rem' }}>
                      YOLOv5 Default Model Results
                    </h4>
                    <img 
                      src={detectedImages.default} 
                      alt="Detected waste with bounding boxes (Default Model)" 
                      className="detected-image"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Detections */}
          {allDetections.length > 0 && (
            <div className="all-detections-section">
              <h3>📋 All Detected Items ({allDetections.length})</h3>
              <div className="detections-grid">
                {allDetections.map((detection, index) => (
                  <div key={index} className="detection-card">
                    <div className="detection-header">
                      <span className="detection-item">🔹 {detection.item}</span>
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

          {/* Primary Classification Result */}
          {result && (
            <div className="result-section">
              <h3>✅ Primary Classification Result</h3>
              <div className="result-card">
                <p><strong>🗑️ Waste Type:</strong> {result.wasteType}</p>
                <p><strong>📦 Category:</strong> <span className={`category-badge ${result.category?.toLowerCase()}`}>{result.category}</span></p>
                <p><strong>🎯 Confidence:</strong> <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{result.confidence}%</span></p>
                <p><strong>♻️ Recyclable:</strong> <span className={result.recyclable ? 'recyclable-yes' : 'recyclable-no'}>{result.recyclable ? 'Yes ✅' : 'No ❌'}</span></p>
                {result.disposal_instructions && (
                  <div className="disposal-instructions">
                    <strong>📌 Disposal Instructions:</strong>
                    <p>{result.disposal_instructions}</p>
                  </div>
                )}
                {result.description && (
                  <p className="description"><strong>ℹ️ Description:</strong> {result.description}</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard