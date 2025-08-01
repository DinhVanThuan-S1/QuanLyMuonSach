const mongoose = require('mongoose');

// Schema cho Độc giả
const docgiaSchema = new mongoose.Schema({
  MaDocGia: {
    type: String,
    required: true,
    unique: true
  },
  HoLot: {
    type: String,
    required: true
  },
  Ten: {
    type: String,
    required: true
  },
  NgaySinh: {
    type: Date,
    required: true
  },
  Phai: {
    type: String,
    enum: ['Nam', 'Nữ'],
    required: true
  },
  DiaChi: {
    type: String,
    required: true
  },
  DienThoai: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true,
    unique: true
  },
  MatKhau: {
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

module.exports = mongoose.model('Docgia', docgiaSchema);