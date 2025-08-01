<template>
  <!-- View Modal placeholder -->
  <div v-if="show" class="modal d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chi tiết sách</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div v-if="book">
            <h6>{{ book.TenSach }}</h6>
            <p><strong>Tác giả:</strong> {{ book.TacGia }}</p>
            <p><strong>Mô tả:</strong> {{ book.MoTa }}</p>
          </div>
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
  name: 'BookViewModal',
  props: {
    show: Boolean,
    book: Object
  },
  emits: ['close']
}
</script>