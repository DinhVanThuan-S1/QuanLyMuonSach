<template>
  <div v-if="bookStore.loading" class="text-center py-4">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Đang tải...</span>
    </div>
  </div>

  <div v-else-if="book" class="row">
    <div class="col-md-4">
      <img 
        :src="bookImageUrl" 
        class="img-fluid rounded shadow"
        :alt="book.TenSach"
        @error="handleImageError"
      >
    </div>
    
    <div class="col-md-8">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/">Trang chủ</router-link>
          </li>
          <li class="breadcrumb-item active">{{ book.TenSach }}</li>
        </ol>
      </nav>

      <h2 class="mb-3">{{ book.TenSach }}</h2>
      
      <div class="mb-3">
        <h5 class="text-muted">Thông tin sách</h5>
        <table class="table table-borderless">
          <tbody>
            <tr>
              <td class="fw-bold" style="width: 150px;">Tác giả:</td>
              <td>{{ book.TacGia }}</td>
            </tr>
            <tr>
              <td class="fw-bold">Nhà xuất bản:</td>
              <td>{{ book.MaNXB?.TenNXB || 'Không có thông tin' }}</td>
            </tr>
            <tr>
              <td class="fw-bold">Năm xuất bản:</td>
              <td>{{ book.NamXuatBan }}</td>
            </tr>
            <tr>
              <td class="fw-bold">Danh mục:</td>
              <td>{{ book.DanhMuc }}</td>
            </tr>
            <tr>
              <td class="fw-bold">Số lượng:</td>
              <td>
                <span :class="book.SoQuyen > 0 ? 'text-success' : 'text-danger'">
                  {{ book.SoQuyen }} cuốn
                </span>
              </td>
            </tr>
            <tr>
              <td class="fw-bold">Giá:</td>
              <td class="text-primary fs-5 fw-bold">{{ formatPrice(book.DonGia) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="book.MoTa" class="mb-4">
        <h5 class="text-muted">Mô tả</h5>
        <p class="text-justify">{{ book.MoTa }}</p>
      </div>

      <div class="d-flex gap-3">
        <button 
          @click="handleBorrow" 
          class="btn btn-primary btn-lg"
          :disabled="book.SoQuyen <= 0 || borrowing"
        >
          {{ book.SoQuyen <= 0 ? 'Hết sách' : (borrowing ? 'Đang xử lý...' : '📚 Mượn sách') }}
        </button>
        
        <router-link to="/" class="btn btn-outline-secondary btn-lg">
          ← Về trang chủ
        </router-link>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-5">
    <h4 class="text-muted">Không tìm thấy thông tin sách</h4>
    <router-link to="/" class="btn btn-primary">Về trang chủ</router-link>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookStore } from '@/stores/book'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'BookDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const bookStore = useBookStore()
    const authStore = useAuthStore()
    
    const book = ref(null)
    const borrowing = ref(false)
    const bookImageUrl = ref('')

    const handleImageError = () => {
      bookImageUrl.value = '/default-book-cover.jpg'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    const handleBorrow = async () => {
      if (!authStore.isLoggedIn) {
        router.push('/login')
        return
      }

      borrowing.value = true
      try {
        const result = await bookStore.borrowBook(book.value.MaSach)
        if (result.success) {
          alert(result.message)
          // Reload thông tin sách để cập nhật số lượng
          loadBookDetail()
        } else {
          alert(result.message)
        }
      } finally {
        borrowing.value = false
      }
    }

    const loadBookDetail = async () => {
      const result = await bookStore.fetchBookDetail(route.params.id)
      if (result.success) {
        book.value = result.data
        bookImageUrl.value = book.value.BiaSach 
          ? `http://localhost:5000${book.value.BiaSach}` 
          : '/default-book-cover.jpg'
      }
    }

    onMounted(() => {
      loadBookDetail()
    })

    return {
      bookStore,
      book,
      borrowing,
      bookImageUrl,
      handleImageError,
      formatPrice,
      handleBorrow
    }
  }
}
</script>

<style scoped>
.img-fluid {
  max-height: 400px;
  object-fit: cover;
}

.table td {
  padding: 0.5rem 0;
}

.text-justify {
  text-align: justify;
}

.breadcrumb-item a {
  text-decoration: none;
}
</style>