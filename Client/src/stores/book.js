import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useBookStore = defineStore('book', {
  state: () => ({
    books: [],
    currentBook: null,
    loading: false,
    totalPages: 0,
    currentPage: 1,
    searchQuery: '',
    sortOption: 'newest'
  }),

  actions: {
    async fetchBooks(page = 1, search = '', sort = 'newest') {
      this.loading = true
      try {
        const response = await api.get('/sach', {
          params: {
            page,
            search,
            sort,
            limit: 12
          }
        })
        
        this.books = response.data.sachs
        this.totalPages = response.data.totalPages
        this.currentPage = response.data.currentPage
        this.searchQuery = search
        this.sortOption = sort

        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Lỗi khi tải danh sách sách' 
        }
      } finally {
        this.loading = false
      }
    },

    async fetchBookDetail(id) {
      this.loading = true
      try {
        const response = await api.get(`/sach/${id}`)
        this.currentBook = response.data
        return { success: true, data: response.data }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Lỗi khi tải thông tin sách' 
        }
      } finally {
        this.loading = false
      }
    },

    async borrowBook(MaSach) {
      try {
        const response = await api.post('/muonsach/register', { MaSach })
        return { 
          success: true, 
          message: response.data.message
        }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Lỗi khi đăng ký mượn sách' 
        }
      }
    }
  }
})