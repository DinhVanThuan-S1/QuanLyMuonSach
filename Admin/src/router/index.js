import { createRouter, createWebHistory } from 'vue-router'
import { useAdminAuthStore } from '@/stores/auth'
import Dashboard from '@/views/Dashboard.vue'
import BookManagement from '@/views/BookManagement.vue'
import BorrowManagement from '@/views/BorrowManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/books',
    name: 'BookManagement',
    component: BookManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/borrows',
    name: 'BorrowManagement',
    component: BorrowManagement,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAdminAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next(false) // Block navigation, let App.vue handle login
  } else {
    next()
  }
})

export default router