<template>
  <!-- Modal placeholder - will be implemented -->
  <div v-if="show" class="modal d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? 'Chỉnh sửa sách' : 'Thêm sách mới' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <p>Modal component đang được phát triển...</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script>
export default {
  name: 'BookModal',
  props: {
    show: Boolean,
    book: Object,
    isEdit: Boolean
  },
  emits: ['close', 'saved']
}
</script>