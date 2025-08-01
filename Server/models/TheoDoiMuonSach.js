const mongoose = require('mongoose');

// Schema cho Theo dõi mượn sách
const theoDoiMuonSachSchema = new mongoose.Schema({
  MaDocGia: {
    type: String,
    required: true,
    ref: 'Docgia'
  },
  MaSach: {
    type: String,
    required: true,
    ref: 'Sach'
  },
  NgayMuon: {
    type: Date,
    default: Date.now
  },
  NgayTra: {
    type: Date,
    required: true
  },
  TrangThai: {
    type: String,
    enum: ['Đã duyệt', 'Từ chối', 'Đang mượn', 'Đã trả', 'Quá hạn'],
    default: 'Đã duyệt'
  },
  GhiChu: {
    type: String,
    default: ''
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index để tăng hiệu suất truy vấn
theoDoiMuonSachSchema.index({ MaDocGia: 1, MaSach: 1 });
theoDoiMuonSachSchema.index({ TrangThai: 1 });

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);