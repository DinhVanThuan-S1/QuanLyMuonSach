<template>
  <div class="book-card h-100">
    <div class="card">
      <img 
        :src="bookImageUrl" 
        class="card-img-top book-cover" 
        :alt="book.TenSach"
        @error="handleImageError"
      >
      <div class="card-body d-flex flex-column">
        <h6 class="card-title">{{ book.TenSach }}</h6>
        <p class="card-text text-muted small">{{ book.TacGia }}</p>
        <p class="card-text text-primary fw-bold">{{ formatPrice(book.DonGia) }}</p>
        
        <div class="mt-auto">
          <div class="d-flex gap-2">
            <router-link 
              :to="`/book/${book._id}`" 
              class="btn btn-outline-primary btn-sm flex-fill"
            >
              Chi tiết
            </router-link>
            <button 
              @click="handleBorrow" 
              class="btn btn-primary btn-sm flex-fill"
              :disabled="book.SoQuyen <= 0 || borrowing"
            >
              {{ book.SoQuyen <= 0 ? 'Hết sách' : (borrowing ? 'Đang xử lý...' : 'Mượn') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBookStore } from '@/stores/book'
import { useRouter } from 'vue-router'

export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  emits: ['borrowed'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const bookStore = useBookStore()
    const router = useRouter()
    const borrowing = ref(false)

    const bookImageUrl = ref(
      props.book.BiaSach 
        ? `http://localhost:5000${props.book.BiaSach}` 
        : '/default-book-cover.jpg'
    )

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
        const result = await bookStore.borrowBook(props.book.MaSach)
        if (result.success) {
          alert(result.message)
          emit('borrowed')
        } else {
          alert(result.message)
        }
      } finally {
        borrowing.value = false
      }
    }

    return {
      bookImageUrl,
      borrowing,
      handleImageError,
      formatPrice,
      handleBorrow
    }
  }
}
</script>

<style scoped>
.book-cover {
  height: 200px;
  object-fit: cover;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-title {
  font-size: 0.9rem;
  line-height: 1.2;
  height: 2.4em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>