<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-lg">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <h2 class="text-primary">🔐 Admin Login</h2>
            <p class="text-muted">Đăng nhập hệ thống quản lý</p>
          </div>
          
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                v-model="form.Email"
                type="email" 
                class="form-control form-control-lg" 
                id="email"
                placeholder="admin@library.com"
                required
              >
            </div>
            
            <div class="mb-4">
              <label for="password" class="form-label">Mật khẩu</label>
              <input 
                v-model="form.Password"
                type="password" 
                class="form-control form-control-lg" 
                id="password"
                placeholder="••••••••"
                required
              >
            </div>

            <div v-if="errorMessage" class="alert alert-danger">
              <small>{{ errorMessage }}</small>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-lg w-100"
              :disabled="loading"
            >
              {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </form>
          
          <div class="text-center mt-4">
            <small class="text-muted">
              Tài khoản mặc định: admin@library.com / admin123
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAdminAuthStore } from '@/stores/auth'

export default {
  name: 'LoginForm',
  setup() {
    const authStore = useAdminAuthStore()
    
    const form = ref({
      Email: '',
      Password: ''
    })
    
    const loading = ref(false)
    const errorMessage = ref('')

    const handleLogin = async () => {
      loading.value = true
      errorMessage.value = ''
      
      try {
        const result = await authStore.login(form.value)
        
        if (!result.success) {
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
  border-radius: 20px;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  border-radius: 12px;
  padding: 12px;
  font-weight: 600;
}
</style>