import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const MOCK_MODE = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
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
  classifyWaste: (imageFile, classificationData) => {
    return Promise.resolve({
      data: {
        category: 'Plastic',
        confidence: 95,
        recyclable: true,
        disposal_instructions: 'Recycle in blue bin'
      }
    });
  },
  getHistory: () => Promise.resolve({ data: [] }),
  getProfile: () => Promise.resolve({ data: {} }),
  updateProfile: () => Promise.resolve({ data: {} }),
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
  
  // Waste Classification - Updated to match backend expectations
  classifyWaste: (imageFile, classificationData) => {
    const formData = new FormData();
    
    // Add the image file
    formData.append('image', imageFile);
    
    // Add classification data fields
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
  
  // History
  getHistory: () => api.get('/user/user-records'),
  
  // Get specific record
  getRecordById: (id) => api.get(`/user/user-records/${id}`),
  
  // User Profile
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  
  // Tips
  getTips: () => api.get('/tips'),
  
  // Statistics
  getStatistics: () => api.get('/waste/statistics')
};

export default api