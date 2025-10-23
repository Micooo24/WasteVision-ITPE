import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const ML_SERVICE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5000'
const MOCK_MODE = false;

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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
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
export const apiService = MOCK_MODE ? {
  login: (credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.email === 'test@test.com' && credentials.password === 'password') {
          resolve({
            data: {
              token: 'mock-token-123',
              user: { name: 'Test User', email: credentials.email }
            }
          });
        } else {
          throw new Error('Invalid credentials');
        }
      }, 500);
    });
  },
  register: (userData) => {
    return Promise.resolve({ data: { message: 'User registered' } });
  },
  classifyWaste: (imageFile) => {
    return Promise.resolve({
      data: {
        wasteType: 'Plastic Bottle',
        category: 'Recyclable',
        confidence: 95,
        recyclable: true,
        disposalMethod: 'Place in blue recycling bin',
        description: 'PET plastic bottle - can be recycled'
      }
    });
  },
  getHistory: () => Promise.resolve({ data: { records: [] } }),
  getProfile: () => Promise.resolve({ data: { user: {} } }),
  updateProfile: () => Promise.resolve({ data: { user: {} } }),
  getTips: () => Promise.resolve({ data: [] }),
  getStatistics: () => Promise.resolve({
    data: {
      totalClassifications: 0,
      recyclable: 0,
      nonRecyclable: 0
    }
  })
} : {
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
  
  // Backend - Save waste classification record
  saveWasteRecord: async (imageFile, classificationData) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (classificationData) {
      if (classificationData.wasteType) formData.append('wasteType', classificationData.wasteType);
      if (classificationData.category) formData.append('category', classificationData.category);
      if (classificationData.confidence !== undefined) formData.append('confidence', classificationData.confidence);
      if (classificationData.recyclable !== undefined) formData.append('recyclable', classificationData.recyclable);
      if (classificationData.disposalMethod) formData.append('disposalMethod', classificationData.disposalMethod);
      if (classificationData.description) formData.append('description', classificationData.description);
    }
    
    return api.post('/user/save-record', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Combined - Classify and Save
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
        confidence: Math.round((detection.confidence || 0) * 100),
        recyclable: detection.type?.toLowerCase() === 'recyclable',
        disposalMethod: getDisposalMethod(detection.type),
        description: `Detected as ${detection.item || 'unknown item'}`
      };
      
      // Step 2: Save to backend
      const saveFormData = new FormData();
      saveFormData.append('image', imageFile);
      saveFormData.append('wasteType', classificationData.wasteType);
      saveFormData.append('category', classificationData.category);
      saveFormData.append('confidence', classificationData.confidence);
      saveFormData.append('recyclable', classificationData.recyclable);
      saveFormData.append('disposalMethod', classificationData.disposalMethod);
      saveFormData.append('description', classificationData.description);
      
      const saveResponse = await api.post('/user/save-record', saveFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Return combined response with bounding box image
      return {
        data: {
          ...saveResponse.data,
          classification: classificationData,
          detectedImage: modelData?.image, // Base64 image with bounding boxes
          allDetections: detections, // All detected items
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
  
  // Get specific record
  getRecordById: (id) => api.get(`/user/user-records/${id}`),
  
  // User Profile
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Tips
  getTips: () => api.get('/tips'),
  
  // Statistics
  getStatistics: () => api.get('/waste/statistics')
};

export default api