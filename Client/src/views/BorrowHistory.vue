<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Lịch sử mượn sách</h2>
      
      <div class="d-flex gap-2">
        <select 
          v-model="selectedStatus" 
          @change="handleStatusFilter"
          class="form-select"
          style="width: auto;"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Từ chối">Từ chối</option>
          <option value="Đang mượn">Đang mượn</option>
          <option value="Đã trả">Đã trả</option>
          <option value="Quá hạn">Quá hạn</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Danh sách phiếu mượn -->
    <div v-else-if="borrowHistory.length > 0" class="row">
      <div 
        v-for="record in borrowHistory" 
        :key="record._id"
        class="col-md-6 col-lg-4 mb-4"
      >
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex">
              <img 
                :src="getBookImageUrl(record.MaSach)" 
                class="book-thumbnail me-3"
                :alt="record.MaSach?.TenSach"
                @error="handleImageError"
              >
              <div class="flex-grow-1">
                <h6 class="card-title">{{ record.MaSach?.TenSach }}</h6>
                <p class="card-text text-muted small mb-1">
                  {{ record.MaSach?.TacGia }}
                </p>
                <p class="card-text text-primary fw-bold mb-2">
                  {{ formatPrice(record.MaSach?.DonGia) }}
                </p>
              </div>
            </div>
            
            <div class="mt-3">
              <div class="row small text-muted">
                <div class="col-6">
                  <strong>Ngày mượn:</strong><br>
                  {{ formatDate(record.NgayMuon) }}
                </div>
                <div class="col-6">
                  <strong>Ngày trả:</strong><br>
                  {{ formatDate(record.NgayTra) }}
                </div>
              </div>
              
              <div class="mt-2">
                <span 
                  class="badge"
                  :class="getStatusClass(record.TrangThai)"
                >
                  {{ record.TrangThai }}
                </span>
              </div>

              <!-- Nút hủy đăng ký -->
              <div v-if="record.TrangThai === 'Đã duyệt'" class="mt-3">
                <button 
                  @click="cancelBorrow(record._id)"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="canceling"
                >
                  {{ canceling ? 'Đang hủy...' : 'Hủy đăng ký' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Không có dữ liệu -->
    <div v-else class="text-center py-5">
      <h5 class="text-muted">Chưa có lịch sử mượn sách</h5>
      <p class="text-muted">Hãy mượn sách đầu tiên của bạn!</p>
      <router-link to="/" class="btn btn-primary">
        Xem sách
      </router-link>
    </div>

    <!-- Phân trang -->
    <nav v-if="totalPages > 1" aria-label="Page navigation">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button 
            @click="changePage(currentPage - 1)"
            class="page-link"
            :disabled="currentPage === 1"
          >
            Trước
          </button>
        </li>
        
        <li 
          v-for="page in visiblePages" 
          :key="page"
          class="page-item" 
          :class="{ active: page === currentPage }"
        >
          <button @click="changePage(page)" class="page-link">
            {{ page }}
          </button>
        </li>
        
        <li 
          class="page-item" 
          :class="{ disabled: currentPage === totalPages }"
        >
          <button 
            @click="changePage(currentPage + 1)"
            class="page-link"
            :disabled="currentPage === totalPages"
          >
            Sau
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

export default {
  name: 'BorrowHistory',
  setup() {
    const borrowHistory = ref([])
    const loading = ref(false)
    const canceling = ref(false)
    const selectedStatus = ref('')
    const currentPage = ref(1)
    const totalPages = ref(0)

    const visiblePages = computed(() => {
      const current = currentPage.value
      const total = totalPages.value
      const pages = []
      
      const start = Math.max(1, current - 2)
      const end = Math.min(total, current + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    const fetchBorrowHistory = async (page = 1, status = '') => {
      loading.value = true
      try {
        const response = await api.get('/muonsach/history', {
          params: {
            page,
            status,
            limit: 9
          }
        })
        
        borrowHistory.value = response.data.phieuMuons
        currentPage.value = response.data.currentPage
        totalPages.value = response.data.totalPages
      } catch (error) {
        console.error('Error fetching borrow history:', error)
        alert('Lỗi khi tải lịch sử mượn sách')
      } finally {
        loading.value = false
      }
    }

    const handleStatusFilter = () => {
      fetchBorrowHistory(1, selectedStatus.value)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        fetchBorrowHistory(page, selectedStatus.value)
      }
    }

    const cancelBorrow = async (id) => {
      if (!confirm('Bạn có chắc chắn muốn hủy đăng ký mượn sách này?')) {
        return
      }

      canceling.value = true
      try {
        await api.delete(`/muonsach/${id}`)
        alert('Hủy đăng ký thành công')
        fetchBorrowHistory(currentPage.value, selectedStatus.value)
      } catch (error) {
        console.error('Error canceling borrow:', error)
        alert(error.response?.data?.message || 'Lỗi khi hủy đăng ký')
      } finally {
        canceling.value = false
      }
    }

    const getBookImageUrl = (book) => {
      return book?.BiaSach 
        ? `http://localhost:5000${book.BiaSach}` 
        : '/default-book-cover.jpg'
    }

    const handleImageError = (event) => {
      event.target.src = '/default-book-cover.jpg'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const getStatusClass = (status) => {
      const statusClasses = {
        'Đã duyệt': 'bg-success',
        'Từ chối': 'bg-danger',
        'Đang mượn': 'bg-primary',
        'Đã trả': 'bg-secondary',
        'Quá hạn': 'bg-warning text-dark'
      }
      return statusClasses[status] || 'bg-secondary'
    }

    onMounted(() => {
      fetchBorrowHistory()
    })

    return {
      borrowHistory,
      loading,
      canceling,
      selectedStatus,
      currentPage,
      totalPages,
      visiblePages,
      fetchBorrowHistory,
      handleStatusFilter,
      changePage,
      cancelBorrow,
      getBookImageUrl,
      handleImageError,
      formatPrice,
      formatDate,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.book-thumbnail {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.badge {
  font-size: 0.75rem;
}
</style>