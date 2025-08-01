<template>
  <nav class="sidebar bg-dark text-white p-3" style="width: 250px;">
    <div class="nav flex-column">
      <router-link 
        to="/" 
        class="nav-link d-flex align-items-center mb-2"
        :class="{ active: $route.name === 'Dashboard' }"
      >
        <span class="me-2">📊</span>
        Tổng quan
      </router-link>
      
      <router-link 
        to="/books" 
        class="nav-link d-flex align-items-center mb-2"
        :class="{ active: $route.name === 'BookManagement' }"
      >
        <span class="me-2">📚</span>
        Quản lý sách
      </router-link>
      
      <router-link 
        to="/borrows" 
        class="nav-link d-flex align-items-center mb-2"
        :class="{ active: $route.name === 'BorrowManagement' }"
      >
        <span class="me-2">📋</span>
        Quản lý mượn sách
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AdminSidebar'
}
</script>

<style scoped>
.sidebar {
  min-height: calc(100vh - 56px);
}

.nav-link {
  color: #adb5bd !important;
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #fff !important;
  background-color: #495057 !important;
}

.nav-link.active {
  background-color: #0d6efd !important;
}
</style>