export const saveToken = (token) => {
  localStorage.setItem('token', token)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const removeToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const checkAuth = async () => {
  const token = getToken()
  if (!token) {
    return false
  }
  
  try {
    // Optionally verify token with backend
    return true
  } catch (error) {
    removeToken()
    return false
  }
}

export const logout = () => {
  removeToken()
  window.location.href = '/login'
}