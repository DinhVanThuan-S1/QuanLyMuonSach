import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('admin_user')) || null,
    token: localStorage.getItem('admin_token') || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userInfo: (state) => state.user
  },

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/auth/login/admin', credentials)
        const { token, user } = response.data

        this.token = token
        this.user = user

        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_user', JSON.stringify(user))

        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Đăng nhập thất bại' 
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    },

    async getProfile() {
      try {
        const response = await api.get('/nhanvien/profile')
        this.user = response.data
        localStorage.setItem('admin_user', JSON.stringify(response.data))
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