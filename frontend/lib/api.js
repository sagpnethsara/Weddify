import axios from 'axios'

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:8000'
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000'

const nodeAPI = axios.create({
  baseURL: NODE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000
})

const mlAPI = axios.create({
  baseURL: ML_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000
})

nodeAPI.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('weddify_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

nodeAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== 'undefined' && err.response?.status === 401) {
      localStorage.removeItem('weddify_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export { nodeAPI, mlAPI }
