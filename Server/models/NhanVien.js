const mongoose = require('mongoose');

// Schema cho Nhân viên
const nhanVienSchema = new mongoose.Schema({
  MSNV: {
    type: String,
    required: true,
    unique: true
  },
  HoTenNV: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  ChucVu: {
    type: String,
    enum: ['Admin', 'Nhân viên'],
    default: 'Nhân viên'
  },
  DiaChi: {
    type: String,
    required: true
  },
  SoDienThoai: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true,
    unique: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NhanVien', nhanVienSchema);