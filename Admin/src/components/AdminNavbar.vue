<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container-fluid">
      <span class="navbar-brand mb-0 h1">
        📚 Admin - Quản lý mượn sách
      </span>
      
      <div class="navbar-nav ms-auto">
        <div class="nav-item dropdown">
          <a 
            class="nav-link dropdown-toggle d-flex align-items-center" 
            href="#" 
            id="navbarDropdown" 
            role="button" 
            data-bs-toggle="dropdown"
          >
            <span class="me-2">👤</span>
            {{ authStore.userInfo?.HoTenNV }}
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <span class="dropdown-item-text">
                <strong>{{ authStore.userInfo?.HoTenNV }}</strong><br>
                <small class="text-muted">{{ authStore.userInfo?.ChucVu }}</small>
              </span>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" @click="logout">
                🚪 Đăng xuất
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAdminAuthStore } from '@/stores/auth'

export default {
  name: 'AdminNavbar',
  setup() {
    const authStore = useAdminAuthStore()

    const logout = () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        authStore.logout()
      }
    }

    return {
      authStore,
      logout
    }
  }
}
</script>