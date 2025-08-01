<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>📋 Quản lý mượn sách</h2>
      <button @click="loadBorrows" class="btn btn-outline-primary">
        🔄 Làm mới
      </button>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
      <div class="col-md-4">
        <select v-model="selectedStatus" @change="handleStatusFilter" class="form-select">
          <option value="">Tất cả trạng thái</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Từ chối">Từ chối</option>
          <option value="Đang mượn">Đang mượn</option>
          <option value="Đã trả">Đã trả</option>
          <option value="Quá hạn">Quá hạn</option>
        </select>
      </div>
      <div class="col-md-4">
        <select v-model="sortOption" @change="handleSort" class="form-select">
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="a-z">A → Z</option>
          <option value="z-a">Z → A</option>
        </select>
      </div>
    </div>

    <!-- Borrows table -->
    <div class="card shadow">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
        </div>
        
        <div v-else-if="borrows.length > 0" class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th>Độc giả</th>
                <th>Sách</th>
                <th>Ngày mượn</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="borrow in borrows" :key="borrow._id">
                <td>
                  <div class="fw-bold">{{ borrow.MaDocGia?.Ten }}</div>
                  <small class="text-muted">{{ borrow.MaDocGia?.DienThoai }}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <img 
                      :src="getBookImageUrl(borrow.MaSach)" 
                      alt="Bìa sách"
                      class="book-thumbnail me-2"
                      @error="handleImageError"
                    >
                    <div>
                      <div class="fw-bold">{{ borrow.MaSach?.TenSach }}</div>
                      <small class="text-muted">{{ borrow.MaSach?.TacGia }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ formatDate(borrow.NgayMuon) }}</td>
                <td>{{ formatDate(borrow.NgayTra) }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(borrow.TrangThai)">
                    {{ borrow.TrangThai }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <!-- Duyệt -> Đang mượn -->
                    <button 
                      v-if="borrow.TrangThai === 'Đã duyệt'"
                      @click="updateStatus(borrow._id, 'borrowing')"
                      class="btn btn-outline-success"
                      title="Chuyển sang đang mượn"
                    >
                      📤
                    </button>
                    
                    <!-- Đang mượn/Quá hạn -> Đã trả -->
                    <button 
                      v-if="['Đang mượn', 'Quá hạn'].includes(borrow.TrangThai)"
                      @click="updateStatus(borrow._id, 'returned')"
                      class="btn btn-outline-primary"
                      title="Đánh dấu đã trả"
                    >
                      📥
                    </button>
                    
                    <!-- Xóa (chỉ Đã duyệt, Từ chối) -->
                    <button 
                      v-if="['Đã duyệt', 'Từ chối'].includes(borrow.TrangThai)"
                      @click="deleteBorrow(borrow._id)"
                      class="btn btn-outline-danger"
                      title="Xóa phiếu mượn"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-5">
          <h5 class="text-muted">Không có phiếu mượn nào</h5>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <nav v-if="totalPages > 1" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button @click="changePage(currentPage - 1)" class="page-link">Trước</button>
        </li>
        <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
          <button @click="changePage(page)" class="page-link">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button @click="changePage(currentPage + 1)" class="page-link">Sau</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

export default {
  name: 'BorrowManagement',
  setup() {
    const borrows = ref([])
    const loading = ref(false)
    const selectedStatus = ref('')
    const sortOption = ref('newest')
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

    const loadBorrows = async (page = 1, status = '', sort = 'newest') => {
      loading.value = true
      try {
        const response = await api.get('/muonsach/admin/all', {
          params: { page, status, sort, limit: 10 }
        })
        
        borrows.value = response.data.phieuMuons
        currentPage.value = response.data.currentPage
        totalPages.value = response.data.totalPages
      } catch (error) {
        console.error('Error loading borrows:', error)
        alert('Lỗi khi tải danh sách phiếu mượn')
      } finally {
        loading.value = false
      }
    }

    const handleStatusFilter = () => {
      loadBorrows(1, selectedStatus.value, sortOption.value)
    }

    const handleSort = () => {
      loadBorrows(currentPage.value, selectedStatus.value, sortOption.value)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        loadBorrows(page, selectedStatus.value, sortOption.value)
      }
    }

    const updateStatus = async (id, action) => {
      try {
        await api.put(`/muonsach/admin/${id}/${action}`)
        alert('Cập nhật trạng thái thành công')
        loadBorrows(currentPage.value, selectedStatus.value, sortOption.value)
      } catch (error) {
        console.error('Error updating status:', error)
        alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
      }
    }

    const deleteBorrow = async (id) => {
      if (!confirm('Bạn có chắc chắn muốn xóa phiếu mượn này?')) {
        return
      }

      try {
        await api.delete(`/muonsach/admin/${id}`)
        alert('Xóa phiếu mượn thành công')
        loadBorrows(currentPage.value, selectedStatus.value, sortOption.value)
      } catch (error) {
        console.error('Error deleting borrow:', error)
        alert(error.response?.data?.message || 'Lỗi khi xóa phiếu mượn')
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
      loadBorrows()
    })

    return {
      borrows,
      loading,
      selectedStatus,
      sortOption,
      currentPage,
      totalPages,
      visiblePages,
      loadBorrows,
      handleStatusFilter,
      handleSort,
      changePage,
      updateStatus,
      deleteBorrow,
      getBookImageUrl,
      handleImageError,
      formatDate,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.book-thumbnail {
  width: 40px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.table th {
  border-top: none;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}
</style>