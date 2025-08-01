<template>
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="card shadow">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">Đăng ký độc giả</h3>
          
          <form @submit.prevent="handleRegister">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="hoLot" class="form-label">Họ lót *</label>
                <input 
                  v-model="form.HoLot"
                  type="text" 
                  class="form-control" 
                  id="hoLot"
                  required
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="ten" class="form-label">Tên *</label>
                <input 
                  v-model="form.Ten"
                  type="text" 
                  class="form-control" 
                  id="ten"
                  required
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="email" class="form-label">Email *</label>
                <input 
                  v-model="form.Email"
                  type="email" 
                  class="form-control" 
                  id="email"
                  required
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="dienThoai" class="form-label">Điện thoại *</label>
                <input 
                  v-model="form.DienThoai"
                  type="tel" 
                  class="form-control" 
                  id="dienThoai"
                  required
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="ngaySinh" class="form-label">Ngày sinh *</label>
                <input 
                  v-model="form.NgaySinh"
                  type="date" 
                  class="form-control" 
                  id="ngaySinh"
                  required
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="phai" class="form-label">Giới tính *</label>
                <select 
                  v-model="form.Phai"
                  class="form-select" 
                  id="phai"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label for="diaChi" class="form-label">Địa chỉ *</label>
              <textarea 
                v-model="form.DiaChi"
                class="form-control" 
                id="diaChi"
                rows="2"
                required
              ></textarea>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="matKhau" class="form-label">Mật khẩu *</label>
                <input 
                  v-model="form.MatKhau"
                  type="password" 
                  class="form-control" 
                  id="matKhau"
                  required
                  minlength="6"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="xacNhanMatKhau" class="form-label">Xác nhận mật khẩu *</label>
                <input 
                  v-model="confirmPassword"
                  type="password" 
                  class="form-control" 
                  id="xacNhanMatKhau"
                  required
                  minlength="6"
                >
              </div>
            </div>

            <div v-if="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary w-100"
              :disabled="loading"
            >
              {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
            </button>
          </form>
          
          <div class="text-center mt-3">
            <p class="mb-0">
              Đã có tài khoản? 
              <router-link to="/login" class="text-decoration-none">
                Đăng nhập ngay
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

export default {
  name: 'Register',
  setup() {
    const authStore = useAuthStore()
    
    const form = ref({
      HoLot: '',
      Ten: '',
      Email: '',
      DienThoai: '',
      NgaySinh: '',
      Phai: '',
      DiaChi: '',
      MatKhau: ''
    })
    
    const confirmPassword = ref('')
    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const handleRegister = async () => {
      // Kiểm tra mật khẩu xác nhận
      if (form.value.MatKhau !== confirmPassword.value) {
        errorMessage.value = 'Mật khẩu xác nhận không khớp'
        return
      }

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''
      
      try {
        const result = await authStore.register(form.value)
        
        if (result.success) {
          successMessage.value = result.message
          // Reset form
          form.value = {
            HoLot: '',
            Ten: '',
            Email: '',
            DienThoai: '',
            NgaySinh: '',
            Phai: '',
            DiaChi: '',
            MatKhau: ''
          }
          confirmPassword.value = ''
        } else {
          errorMessage.value = result.message
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      confirmPassword,
      loading,
      errorMessage,
      successMessage,
      handleRegister
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 15px;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  border-radius: 8px;
  padding: 12px;
}
</style>