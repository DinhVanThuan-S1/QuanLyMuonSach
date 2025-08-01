import axios from 'axios'

const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  timeout: 10000
})

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default api