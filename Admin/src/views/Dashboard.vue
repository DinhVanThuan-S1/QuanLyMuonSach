<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>📊 Tổng quan</h2>
      <button @click="loadStats" class="btn btn-outline-primary">
        🔄 Làm mới
      </button>
    </div>

    <!-- Statistics Cards -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else class="row">
      <!-- Tổng số sách trong kho -->
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-primary shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Sách trong kho
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ stats.totalBooksInStock || 0 }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-books fa-2x text-gray-300">📚</i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Số sách đang mượn -->
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-warning shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                  Đang mượn
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ stats.borrowingBooks || 0 }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-hand-holding fa-2x text-gray-300">📋</i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tổng số độc giả -->
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-info shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                  Độc giả
                </div>
                <div class="h5 mb-0 mr-3 font-weight-bold text-gray-800">
                  {{ stats.totalReaders || 0 }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-users fa-2x text-gray-300">👥</i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tổng số nhà xuất bản -->
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-success shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                  Nhà xuất bản
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ stats.totalPublishers || 0 }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-building fa-2x text-gray-300">🏢</i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row">
      <!-- Thống kê trạng thái mượn sách -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Thống kê trạng thái mượn sách</h6>
          </div>
          <div class="card-body">
            <div v-if="stats.borrowStats && stats.borrowStats.length > 0">
              <div v-for="stat in stats.borrowStats" :key="stat._id" class="mb-3">
                <div class="d-flex justify-content-between">
                  <span>{{ stat._id }}</span>
                  <span class="font-weight-bold">{{ stat.count }}</span>
                </div>
                <div class="progress">
                  <div 
                    class="progress-bar"
                    :class="getStatusProgressClass(stat._id)"
                    :style="{ width: getProgressWidth(stat.count) }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted text-center py-3">
              Chưa có dữ liệu
            </div>
          </div>
        </div>
      </div>

      <!-- Sách được mượn nhiều nhất -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Sách được mượn nhiều nhất</h6>
          </div>
          <div class="card-body">
            <div v-if="stats.popularBooks && stats.popularBooks.length > 0">
              <div v-for="(book, index) in stats.popularBooks" :key="book._id" class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div class="font-weight-bold">{{ index + 1 }}. {{ book.TenSach }}</div>
                  <small class="text-muted">{{ book.TacGia }}</small>
                </div>
                <span class="badge bg-primary">{{ book.count }} lần</span>
              </div>
            </div>
            <div v-else class="text-muted text-center py-3">
              Chưa có dữ liệu
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

export default {
  name: 'Dashboard',
  setup() {
    const stats = ref({})
    const loading = ref(false)

    const loadStats = async () => {
      loading.value = true
      try {
        const response = await api.get('/dashboard/stats')
        stats.value = response.data
      } catch (error) {
        console.error('Error loading stats:', error)
        alert('Lỗi khi tải thống kê')
      } finally {
        loading.value = false
      }
    }

    const getStatusProgressClass = (status) => {
      const classes = {
        'Đã duyệt': 'bg-success',
        'Từ chối': 'bg-danger', 
        'Đang mượn': 'bg-primary',
        'Đã trả': 'bg-secondary',
        'Quá hạn': 'bg-warning'
      }
      return classes[status] || 'bg-secondary'
    }

    const getProgressWidth = (count) => {
      if (!stats.value.borrowStats) return '0%'
      const max = Math.max(...stats.value.borrowStats.map(s => s.count))
      return `${(count / max) * 100}%`
    }

    onMounted(() => {
      loadStats()
    })

    return {
      stats,
      loading,
      loadStats,
      getStatusProgressClass,
      getProgressWidth
    }
  }
}
</script>

<style scoped>
.border-left-primary {
  border-left: 0.25rem solid #4e73df !important;
}
.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}
.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}
.border-left-success {
  border-left: 0.25rem solid #1cc88a !important;
}

.text-xs {
  font-size: 0.7rem;
}

.progress {
  height: 0.5rem;
}
</style>