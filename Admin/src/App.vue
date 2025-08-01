<template>
  <div id="app">
    <div v-if="!authStore.isLoggedIn" class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <LoginForm />
    </div>
    <div v-else>
      <AdminNavbar />
      <div class="d-flex">
        <AdminSidebar />
        <main class="flex-grow-1 p-4">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminAuthStore } from './stores/auth'
import LoginForm from './components/LoginForm.vue'
import AdminNavbar from './components/AdminNavbar.vue'
import AdminSidebar from './components/AdminSidebar.vue'

export default {
  name: 'App',
  components: {
    LoginForm,
    AdminNavbar,
    AdminSidebar
  },
  setup() {
    const authStore = useAdminAuthStore()

    return {
      authStore
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: #f8f9fa;
}

.sidebar {
  min-height: calc(100vh - 56px);
  background-color: #343a40;
}

.sidebar .nav-link {
  color: #adb5bd;
}

.sidebar .nav-link:hover,
.sidebar .nav-link.active {
  color: #fff;
  background-color: #495057;
}
</style>