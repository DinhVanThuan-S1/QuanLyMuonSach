import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userInfo: (state) => state.user
  },

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/auth/login/docgia', credentials)
        const { token, user } = response.data

        this.token = token
        this.user = user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Đăng nhập thất bại' 
        }
      }
    },

    async register(userData) {
      try {
        const response = await api.post('/auth/register/docgia', userData)
        return { 
          success: true, 
          message: 'Đăng ký thành công! Vui lòng đăng nhập.' 
        }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Đăng ký thất bại' 
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async getProfile() {
      try {
        const response = await api.get('/docgia/profile')
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        return { success: true, data: response.data }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Lỗi khi tải thông tin' 
        }
      }
    }
  }
})