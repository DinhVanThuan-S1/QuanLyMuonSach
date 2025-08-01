const mongoose = require('mongoose');

// Schema cho Sách
const sachSchema = new mongoose.Schema({
  MaSach: {
    type: String,
    required: true,
    unique: true
  },
  TenSach: {
    type: String,
    required: true
  },
  MoTa: {
    type: String,
    default: ''
  },
  DonGia: {
    type: Number,
    required: true
  },
  SoQuyen: {
    type: Number,
    required: true,
    default: 0
  },
  NamXuatBan: {
    type: Number,
    required: true
  },
  MaNXB: {
    type: String,
    required: true,
    ref: 'NhaXuatBan'
  },
  TacGia: {
    type: String,
    required: true
  },
  DanhMuc: {
    type: String,
    default: 'Khác'
  },
  BiaSach: {
    type: String, // URL hoặc path đến file ảnh
    default: ''
  },
  NguoiTao: {
    type: String,
    required: true, // MSNV của nhân viên tạo
    ref: 'NhanVien'
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sach', sachSchema);