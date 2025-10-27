import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [captureMode, setCaptureMode] = useState('upload') // 'upload' or 'camera'
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    fetchStatistics()
    
    // Cleanup camera on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
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

  // Enhanced Start Camera with better error handling and debugging
  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...')
      setCameraError(null)
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'Camera not supported in this browser. Please use Chrome, Edge, or Firefox.'
        setCameraError(errorMsg)
        toast.error(errorMsg, { duration: 5000 })
        return
      }

      // IMPORTANT: Wait a bit for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!videoRef.current) {
        console.error('❌ Video element ref is null after waiting')
        setCameraError('Video element not ready. Please try again.')
        toast.error('Video element not ready. Please try again.', { duration: 3000 })
        return
      }

      console.log('✅ Video element exists:', videoRef.current)

      // Stop any existing stream first
      if (streamRef.current) {
        console.log('🛑 Stopping existing stream...')
        streamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('Track stopped:', track.label)
        })
        streamRef.current = null
      }

      // Clear video element
      videoRef.current.srcObject = null

      console.log('📹 Requesting camera permission...')
      
      // Request camera with constraints (similar to reference code)
      const constraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user' // Front camera
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('✅ Camera stream obtained!')
      console.log('Stream tracks:', stream.getTracks().map(t => ({
        kind: t.kind,
        label: t.label,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })))

      // Double-check video element still exists
      if (!videoRef.current) {
        console.error('❌ Video element ref became null')
        stream.getTracks().forEach(track => track.stop())
        toast.error('Video element disappeared. Please try again.')
        return
      }

      // Set stream to video element
      videoRef.current.srcObject = stream
      streamRef.current = stream
      
      console.log('🎬 Video srcObject set, attempting to play...')

      // Wait for metadata to load
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Metadata load timeout'))
        }, 5000)

        if (!videoRef.current) {
          clearTimeout(timeoutId)
          reject(new Error('Video element is null'))
          return
        }

        videoRef.current.onloadedmetadata = () => {
          console.log('📊 Metadata loaded:', {
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight,
            duration: videoRef.current.duration
          })
          clearTimeout(timeoutId)
          resolve()
        }

        videoRef.current.onerror = (e) => {
          console.error('❌ Video element error:', e)
          clearTimeout(timeoutId)
          reject(new Error('Video element error'))
        }
      })

      // Force play with retry mechanism
      let playAttempts = 0
      const maxAttempts = 3

      const attemptPlay = async () => {
        try {
          playAttempts++
          console.log(`▶️ Play attempt ${playAttempts}/${maxAttempts}...`)
          
          if (!videoRef.current) {
            throw new Error('Video element is null')
          }

          await videoRef.current.play()
          
          console.log('✅ Video playing successfully!')
          console.log('Video state:', {
            paused: videoRef.current.paused,
            ended: videoRef.current.ended,
            currentTime: videoRef.current.currentTime,
            readyState: videoRef.current.readyState
          })

          setIsCameraActive(true)
          setCameraError(null)
          toast.success('📹 Camera started successfully!', { duration: 2000 })
          
        } catch (playError) {
          console.error(`❌ Play attempt ${playAttempts} failed:`, playError)
          
          if (playAttempts < maxAttempts) {
            console.log(`🔄 Retrying in 500ms...`)
            await new Promise(resolve => setTimeout(resolve, 500))
            return attemptPlay()
          } else {
            throw new Error(`Failed to play video after ${maxAttempts} attempts: ${playError.message}`)
          }
        }
      }

      await attemptPlay()

    } catch (error) {
      console.error('❌ Camera access error:', error)
      
      let errorMessage = 'Failed to access camera.'
      let errorDetails = error.message
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = '🚫 Camera permission denied'
        errorDetails = 'Please allow camera access:\n1. Click the camera icon in the address bar\n2. Select "Allow"\n3. Refresh the page and try again'
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = '📷 No camera found'
        errorDetails = 'Please connect a camera device and try again'
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = '🔒 Camera is already in use'
        errorDetails = 'Please close other apps using the camera (Zoom, Teams, Skype, etc.) and try again'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '⚙️ Camera settings not supported'
        errorDetails = 'Trying with basic settings...'
        
        // Try with simpler constraints
        try {
          console.log('🔄 Retrying with basic constraints...')
          
          if (!videoRef.current) {
            throw new Error('Video element is null during retry')
          }

          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true })
          
          videoRef.current.srcObject = simpleStream
          streamRef.current = simpleStream
          
          await videoRef.current.play()
          setIsCameraActive(true)
          toast.success('📹 Camera started with basic settings', { duration: 2000 })
          return
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError)
          errorDetails = 'Your camera does not support the required settings'
        }
      } else if (error.name === 'SecurityError') {
        errorMessage = '🔐 Security error'
        errorDetails = 'Camera access requires HTTPS or localhost. Current URL: ' + window.location.href
      } else if (error.message.includes('Video element is null')) {
        errorMessage = '⚠️ Video element not ready'
        errorDetails = 'The camera view is not ready yet. Please:\n1. Wait a moment\n2. Click "Start Camera" again'
      }
      
      setCameraError(`${errorMessage}\n${errorDetails}`)
      toast.error(errorMessage, { duration: 6000 })
      
      // Show detailed error in console for debugging
      console.error('Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
  }

  // Stop Camera
  const stopCamera = () => {
    console.log('🛑 Stopping camera...')
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('Track stopped:', track.label)
      })
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsCameraActive(false)
    setCameraError(null)
    toast.success('Camera stopped', { duration: 1500 })
  }

  // Capture Photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Check if video is actually playing
    if (video.paused || video.ended || video.readyState < 2) {
      toast.error('Video not ready. Please wait for camera to fully initialize.')
      return
    }
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    console.log('📸 Capturing photo:', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    })
    
    const context = canvas.getContext('2d')
    
    // Mirror the image horizontally (to match the mirrored video display)
    context.save()
    context.scale(-1, 1)
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    context.restore()
    
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed to capture photo')
        return
      }

      const file = new File([blob], 'captured-waste.jpg', { type: 'image/jpeg' })
      const imageUrl = URL.createObjectURL(blob)
      
      console.log('✅ Photo captured:', {
        size: blob.size,
        type: blob.type
      })
      
      setCapturedImage(imageUrl)
      setSelectedFile(file)
      setPreview(imageUrl)
      stopCamera()
      
      // Reset results
      setResult(null)
      setDetectedImages({ custom: null, default: null })
      setAllDetections([])
      
      toast.success('📸 Photo captured! Click "Classify Waste" to analyze.', { duration: 3000 })
    }, 'image/jpeg', 0.95)
  }, [])

  // Handle File Upload
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
        setCapturedImage(null)
      }
      reader.readAsDataURL(file)
      
      // Reset results
      setResult(null)
      setDetectedImages({ custom: null, default: null })
      setAllDetections([])
      toast.success('Image selected successfully')
    }
  }

  // Handle Submit/Classify - Works for BOTH upload and camera
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
      // Call the API service (works for both upload and camera)
      const response = await apiService.classifyWaste(selectedFile)
      
      console.log('API Response:', response.data)
      
      const classification = response.data.classification || response.data
      
      // Set classification result
      setResult({
        category: classification.category,
        confidence: classification.confidence,
        recyclable: classification.recyclable,
        disposal_instructions: classification.disposalMethod,
        wasteType: classification.wasteType,
        description: classification.description
      })

      // Set detected images from both models
      if (response.data.customModel || response.data.defaultModel) {
        setDetectedImages({
          custom: response.data.customModel?.image || null,
          default: response.data.defaultModel?.image || null
        })
        
        console.log('Custom Model Image:', response.data.customModel?.image ? 'Available' : 'Not available')
        console.log('Default Model Image:', response.data.defaultModel?.image ? 'Available' : 'Not available')
      }

      // Set all detections
      if (response.data.allDetections && response.data.allDetections.length > 0) {
        setAllDetections(response.data.allDetections)
        console.log('Total detections:', response.data.allDetections.length)
      }
      
      // Update statistics
      fetchStatistics()
      
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
    setCameraError(null)
    if (isCameraActive) {
      stopCamera()
    }
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
      <Navbar />
      <div className="main-content">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <main className={`content ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="dashboard-header">
            <h2>🗑️ Waste Classification Dashboard</h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Upload an image or use your camera to classify waste with AI
            </p>
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

            {/* Camera Mode - ALWAYS RENDER VIDEO ELEMENT */}
            {captureMode === 'camera' && (
              <>
                <h3>📷 Capture from Camera</h3>
                
                {/* Camera Error Display */}
                {cameraError && (
                  <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '1rem',
                    whiteSpace: 'pre-line'
                  }}>
                    <strong style={{ color: '#dc2626' }}>❌ Camera Error:</strong>
                    <p style={{ margin: '8px 0 0 0', color: '#991b1b', fontSize: '0.9rem' }}>
                      {cameraError}
                    </p>
                  </div>
                )}

                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  maxWidth: '640px', 
                  margin: '0 auto', 
                  aspectRatio: '4/3', 
                  backgroundColor: '#000', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  marginBottom: '1rem',
                  border: '2px solid #4CAF50'
                }}>
                  {/* ALWAYS render video element, just hide it when not active */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: 'scaleX(-1)', // Mirror the video
                      display: isCameraActive ? 'block' : 'none'
                    }}
                  />
                  
                  {isCameraActive && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(76, 175, 80, 0.9)',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      🔴 LIVE
                    </div>
                  )}
                  
                  {capturedImage && (
                    <>
                      <img 
                        src={capturedImage} 
                        alt="Captured waste" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: 'rgba(33, 150, 243, 0.9)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        ✅ CAPTURED
                      </div>
                    </>
                  )}
                  
                  {!isCameraActive && !capturedImage && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%', 
                      color: '#fff', 
                      fontSize: '1.2rem', 
                      flexDirection: 'column', 
                      gap: '1rem' 
                    }}>
                      <span style={{ fontSize: '3rem' }}>📷</span>
                      <span>Camera Preview</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Click "Start Camera" to begin</span>
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '640px', margin: '0 auto' }}>
                  {!isCameraActive && !capturedImage && (
                    <button 
                      onClick={startCamera}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={loading}
                    >
                      📹 Start Camera
                    </button>
                  )}
                  
                  {isCameraActive && (
                    <>
                      <button 
                        onClick={capturePhoto}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '1.1rem' }}
                      >
                        📸 Capture Photo
                      </button>
                      <button 
                        onClick={stopCamera}
                        className="btn"
                        style={{ flex: 1, backgroundColor: '#f44336', color: 'white' }}
                      >
                        ⏹️ Stop Camera
                      </button>
                    </>
                  )}
                  
                  {capturedImage && !result && (
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
                          setCameraError(null)
                          startCamera()
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
      <Footer className={isCollapsed ? 'collapsed' : ''} />
    </div>
  )
}

export default Dashboard