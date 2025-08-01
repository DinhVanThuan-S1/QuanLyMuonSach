<template>
  <div>
    <!-- Header với tìm kiếm và sắp xếp -->
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
          <button 
            @click="handleSearch"
            class="btn btn-outline-primary" 
            type="button"
          >
            🔍 Tìm kiếm
          </button>
        </div>
      </div>
      <div class="col-md-4">
        <select 
          v-model="sortOption" 
          @change="handleSort"
          class="form-select"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="a-z">A → Z</option>
          <option value="z-a">Z → A</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="bookStore.loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Danh sách sách -->
    <div v-else-if="bookStore.books.length > 0" class="row">
      <div 
        v-for="book in bookStore.books" 
        :key="book._id" 
        class="col-xl-3 col-lg-4 col-md-6 mb-4"
      >
        <BookCard :book="book" @borrowed="handleBookBorrowed" />
      </div>
    </div>

    <!-- Không có kết quả -->
    <div v-else class="text-center py-5">
      <h5 class="text-muted">Không tìm thấy sách nào</h5>
      <p class="text-muted">Hãy thử tìm kiếm với từ khóa khác</p>
    </div>

    <!-- Phân trang -->
    <nav v-if="bookStore.totalPages > 1" aria-label="Page navigation">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: bookStore.currentPage === 1 }">
          <button 
            @click="changePage(bookStore.currentPage - 1)"
            class="page-link"
            :disabled="bookStore.currentPage === 1"
          >
            Trước
          </button>
        </li>
        
        <li 
          v-for="page in visiblePages" 
          :key="page"
          class="page-item" 
          :class="{ active: page === bookStore.currentPage }"
        >
          <button @click="changePage(page)" class="page-link">
            {{ page }}
          </button>
        </li>
        
        <li 
          class="page-item" 
          :class="{ disabled: bookStore.currentPage === bookStore.totalPages }"
        >
          <button 
            @click="changePage(bookStore.currentPage + 1)"
            class="page-link"
            :disabled="bookStore.currentPage === bookStore.totalPages"
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
import { useBookStore } from '@/stores/book'
import BookCard from '@/components/BookCard.vue'

export default {
  name: 'Home',
  components: {
    BookCard
  },
  setup() {
    const bookStore = useBookStore()
    const searchQuery = ref('')
    const sortOption = ref('newest')

    const visiblePages = computed(() => {
      const current = bookStore.currentPage
      const total = bookStore.totalPages
      const pages = []
      
      const start = Math.max(1, current - 2)
      const end = Math.min(total, current + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    const handleSearch = () => {
      bookStore.fetchBooks(1, searchQuery.value, sortOption.value)
    }

    const handleSort = () => {
      bookStore.fetchBooks(bookStore.currentPage, searchQuery.value, sortOption.value)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= bookStore.totalPages) {
        bookStore.fetchBooks(page, searchQuery.value, sortOption.value)
      }
    }

    const handleBookBorrowed = () => {
      // Reload trang hiện tại để cập nhật số lượng sách
      bookStore.fetchBooks(bookStore.currentPage, searchQuery.value, sortOption.value)
    }

    onMounted(() => {
      bookStore.fetchBooks()
    })

    return {
      bookStore,
      searchQuery,
      sortOption,
      visiblePages,
      handleSearch,
      handleSort,
      changePage,
      handleBookBorrowed
    }
  }
}
</script>

<style scoped>
.input-group {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.pagination {
  margin-top: 2rem;
}

.page-link {
  color: #0d6efd;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>