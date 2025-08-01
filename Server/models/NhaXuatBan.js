const mongoose = require('mongoose');

// Schema cho Nhà xuất bản
const nhaXuatBanSchema = new mongoose.Schema({
  MaNXB: {
    type: String,
    required: true,
    unique: true
  },
  TenNXB: {
    type: String,
    required: true
  },
  DiaChi: {
    type: String,
    required: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NhaXuatBan', nhaXuatBanSchema);