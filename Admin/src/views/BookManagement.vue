<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>📚 Quản lý sách</h2>
      <button @click="showAddModal = true" class="btn btn-primary">
        ➕ Thêm sách mới
      </button>
    </div>

    <!-- Search and filters -->
    <div class="row mb-4">
      <div class="col-md-8">
        <div class="input-group">
          <input 
            v-model="searchQuery" 
            @keyup.enter="handleSearch"
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm sách theo tên hoặc tác giả..."
          >
          <button @click="handleSearch" class="btn btn-outline-primary">
            🔍 Tìm kiếm
          </button>
        </div>
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

    <!-- Books table -->
    <div class="card shadow">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
        </div>
        
        <div v-else-if="books.length > 0" class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th>Mã sách</th>
                <th>Bìa</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>NXB</th>
                <th>Số lượng</th>
                <th>Giá</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books" :key="book._id">
                <td>{{ book.MaSach }}</td>
                <td>
                  <img 
                    :src="getBookImageUrl(book)" 
                    alt="Bìa sách"
                    class="book-thumbnail"
                    @error="handleImageError"
                  >
                </td>
                <td>
                  <div class="fw-bold">{{ book.TenSach }}</div>
                  <small class="text-muted">{{ book.DanhMuc }}</small>
                </td>
                <td>{{ book.TacGia }}</td>
                <td>{{ book.MaNXB?.TenNXB }}</td>
                <td>
                  <span :class="book.SoQuyen > 0 ? 'text-success' : 'text-danger'">
                    {{ book.SoQuyen }}
                  </span>
                </td>
                <td>{{ formatPrice(book.DonGia) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button @click="viewBook(book)" class="btn btn-outline-info">
                      👁️
                    </button>
                    <button @click="editBook(book)" class="btn btn-outline-primary">
                      ✏️
                    </button>
                    <button @click="deleteBook(book)" class="btn btn-outline-danger">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-5">
          <h5 class="text-muted">Không có sách nào</h5>
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

    <!-- Add/Edit Modal -->
    <BookModal 
      v-if="showAddModal || showEditModal"
      :show="showAddModal || showEditModal"
      :book="selectedBook"
      :isEdit="showEditModal"
      @close="closeModal"
      @saved="handleBookSaved"
    />

    <!-- View Modal -->
    <BookViewModal
      v-if="showViewModal"
      :show="showViewModal"
      :book="selectedBook"
      @close="showViewModal = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import BookModal from '@/components/BookModal.vue'
import BookViewModal from '@/components/BookViewModal.vue'

export default {
  name: 'BookManagement',
  components: {
    BookModal,
    BookViewModal
  },
  setup() {
    const books = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const sortOption = ref('newest')
    const currentPage = ref(1)
    const totalPages = ref(0)
    
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    const selectedBook = ref(null)

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

    const fetchBooks = async (page = 1, search = '', sort = 'newest') => {
      loading.value = true
      try {
        const response = await api.get('/sach', {
          params: { page, search, sort, limit: 10 }
        })
        
        books.value = response.data.sachs
        currentPage.value = response.data.currentPage
        totalPages.value = response.data.totalPages
      } catch (error) {
        console.error('Error fetching books:', error)
        alert('Lỗi khi tải danh sách sách')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      fetchBooks(1, searchQuery.value, sortOption.value)
    }

    const handleSort = () => {
      fetchBooks(currentPage.value, searchQuery.value, sortOption.value)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        fetchBooks(page, searchQuery.value, sortOption.value)
      }
    }

    const viewBook = (book) => {
      selectedBook.value = book
      showViewModal.value = true
    }

    const editBook = (book) => {
      selectedBook.value = book
      showEditModal.value = true
    }

    const deleteBook = async (book) => {
      if (!confirm(`Bạn có chắc chắn muốn xóa sách "${book.TenSach}"?`)) {
        return
      }

      try {
        await api.delete(`/sach/${book._id}`)
        alert('Xóa sách thành công')
        fetchBooks(currentPage.value, searchQuery.value, sortOption.value)
      } catch (error) {
        console.error('Error deleting book:', error)
        alert('Lỗi khi xóa sách')
      }
    }

    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      selectedBook.value = null
    }

    const handleBookSaved = () => {
      closeModal()
      fetchBooks(currentPage.value, searchQuery.value, sortOption.value)
    }

    const getBookImageUrl = (book) => {
      return book.BiaSach 
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

    onMounted(() => {
      fetchBooks()
    })

    return {
      books,
      loading,
      searchQuery,
      sortOption,
      currentPage,
      totalPages,
      visiblePages,
      showAddModal,
      showEditModal,
      showViewModal,
      selectedBook,
      fetchBooks,
      handleSearch,
      handleSort,
      changePage,
      viewBook,
      editBook,
      deleteBook,
      closeModal,
      handleBookSaved,
      getBookImageUrl,
      handleImageError,
      formatPrice
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