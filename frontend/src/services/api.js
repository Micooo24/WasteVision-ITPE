import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const ML_SERVICE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ML Service API instance
const mlApi = axios.create({
  baseURL: ML_SERVICE_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

// Add token to backend API requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Force reload to login page
      window.location.href = '/login'
      
      // Optionally show alert
      if (!window.location.pathname.includes('/login')) {
        alert('Your session has expired. Please login again.')
      }
    }
    return Promise.reject(error)
  }
)

// Helper function to get disposal method based on waste type
function getDisposalMethod(wasteType) {
  const methods = {
    'recyclable': 'Place in blue recycling bin. Rinse and clean before recycling.',
    'biodegradable': 'Place in green compost bin. Can be composted.',
    'hazardous': 'Take to designated hazardous waste collection point. Do not dispose in regular bins.',
    'not waste': 'This item does not appear to be waste.',
    'unknown': 'Please consult local waste management for proper disposal.'
  };
  
  return methods[wasteType?.toLowerCase()] || methods['unknown'];
}

// API methods
export const apiService = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  
  // ML Service - Classify Waste
  classifyWasteML: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    return mlApi.post('/identify', formData);
  },
  
  // ML Service - Health Check
  checkMLHealth: () => mlApi.get('/health'),
  
  // Combined - Classify and Save with detected image
  classifyWaste: async (imageFile) => {
    try {
      // Step 1: Classify using ML service
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const mlResponse = await mlApi.post('/identify', formData);
      
      // Extract data from ML service response
      const customModel = mlResponse.data.custom_model;
      const defaultModel = mlResponse.data.default_model;
      
      // Use custom model data if available, otherwise use default model
      const modelData = customModel || defaultModel;
      const detections = modelData?.detections || [];
      
      // If no detections, return a default response
      if (detections.length === 0) {
        throw new Error('No waste detected in the image. Please try another image.');
      }
      
      // Get the first detection (highest confidence)
      const detection = detections[0];
      
      // Map the detection to our format
      const classificationData = {
        wasteType: detection.item || 'Unknown',
        category: detection.type || 'Unknown',
        confidence: detection.confidence || 0, // Keep as decimal (0-1)
        recyclable: detection.type?.toLowerCase() === 'recyclable',
        disposalMethod: getDisposalMethod(detection.type),
        description: `Detected as ${detection.item || 'unknown item'}`
      };
      
      // Get the detected image (prefer custom model)
      const detectedImageBase64 = customModel?.image || defaultModel?.image || null;
      
      // Step 2: Save to backend with detected image
      const saveFormData = new FormData();
      saveFormData.append('image', imageFile);
      saveFormData.append('wasteType', classificationData.wasteType);
      saveFormData.append('category', classificationData.category);
      saveFormData.append('confidence', classificationData.confidence); // Send as decimal
      saveFormData.append('recyclable', classificationData.recyclable); // Send as boolean
      saveFormData.append('disposalMethod', classificationData.disposalMethod);
      saveFormData.append('description', classificationData.description);
      
      // Add detected image if available
      if (detectedImageBase64) {
        saveFormData.append('detectedImageBase64', detectedImageBase64);
      }
      
      const saveResponse = await api.post('/user/save-record', saveFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Return combined response with bounding box images
      return {
        data: {
          ...saveResponse.data,
          classification: {
            ...classificationData,
            confidence: Math.round(classificationData.confidence * 100) // Convert to percentage for display
          },
          detectedImage: modelData?.image,
          allDetections: detections,
          customModel: customModel,
          defaultModel: defaultModel
        }
      };
    } catch (error) {
      console.error('Error in classifyWaste:', error);
      throw error;
    }
  },
  
  // History
  getHistory: () => api.get('/user/user-records'),
  
  // Get specific record by ID
  getRecordById: (id) => api.get(`/user/user-records/${id}`),
  
  // Delete record by ID
  deleteRecord: (id) => api.delete(`/user/user-records/${id}`),
  
  // User Profile
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (formData) => api.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Tips
  getTips: () => api.get('/tips'),
  
  // User Statistics
  getUserStatistics: () => api.get('/user/statistics'),
  // Statistics
  getStatistics: () => api.get('/waste/statistics')
};

export default api