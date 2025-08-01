<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">Đăng nhập</h3>
          
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                v-model="form.Email"
                type="email" 
                class="form-control" 
                id="email"
                required
              >
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label">Mật khẩu</label>
              <input 
                v-model="form.MatKhau"
                type="password" 
                class="form-control" 
                id="password"
                required
              >
            </div>

            <div v-if="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary w-100"
              :disabled="loading"
            >
              {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </form>
          
          <div class="text-center mt-3">
            <p class="mb-0">
              Chưa có tài khoản? 
              <router-link to="/register" class="text-decoration-none">
                Đăng ký ngay
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const form = ref({
      Email: '',
      MatKhau: ''
    })
    
    const loading = ref(false)
    const errorMessage = ref('')

    const handleLogin = async () => {
      loading.value = true
      errorMessage.value = ''
      
      try {
        const result = await authStore.login(form.value)
        
        if (result.success) {
          router.push('/')
        } else {
          errorMessage.value = result.message
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      errorMessage,
      handleLogin
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 15px;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  border-radius: 8px;
  padding: 12px;
}
</style>