const express = require('express');
const bcrypt = require('bcryptjs');
const NhanVien = require('../models/NhanVien');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

// Tạo tài khoản admin mặc định (chỉ chạy 1 lần)
router.post('/init', async (req, res) => {
  try {
    const existingAdmin = await NhanVien.findOne({ MSNV: 'ADMIN001' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new NhanVien({
      MSNV: 'ADMIN001',
      HoTenNV: 'Administrator',
      Password: hashedPassword,
      ChucVu: 'Admin',
      DiaChi: 'Hà Nội',
      SoDienThoai: '0123456789',
      Email: 'admin@library.com'
    });

    await admin.save();
    res.status(201).json({ message: 'Tạo tài khoản admin thành công', MSNV: admin.MSNV });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thông tin nhân viên hiện tại
router.get('/profile', authAdmin, async (req, res) => {
  try {
    const nhanvien = await NhanVien.findById(req.user.id).select('-Password');
    if (!nhanvien || nhanvien.deleted) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json(nhanvien);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;