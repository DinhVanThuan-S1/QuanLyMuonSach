const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Docgia = require('../models/Docgia');
const NhanVien = require('../models/NhanVien');

const router = express.Router();

// Đăng ký độc giả
router.post('/register/docgia', async (req, res) => {
  try {
    const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, Email, MatKhau } = req.body;

    // Kiểm tra email đã tồn tại
    const existingDocgia = await Docgia.findOne({ Email, deleted: false });
    if (existingDocgia) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo mã độc giả tự động
    const count = await Docgia.countDocuments({ deleted: false });
    const MaDocGia = `DG${String(count + 1).padStart(4, '0')}`;

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(MatKhau, 10);

    const docgia = new Docgia({
      MaDocGia,
      HoLot,
      Ten,
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      Email,
      MatKhau: hashedPassword
    });

    await docgia.save();

    res.status(201).json({ 
      message: 'Đăng ký thành công',
      MaDocGia: docgia.MaDocGia
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng nhập độc giả
router.post('/login/docgia', async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;

    const docgia = await Docgia.findOne({ Email, deleted: false });
    if (!docgia) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(MatKhau, docgia.MatKhau);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { 
        id: docgia._id, 
        MaDocGia: docgia.MaDocGia,
        userType: 'docgia'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        MaDocGia: docgia.MaDocGia,
        HoLot: docgia.HoLot,
        Ten: docgia.Ten,
        Email: docgia.Email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng nhập nhân viên/admin
router.post('/login/admin', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const nhanvien = await NhanVien.findOne({ Email, deleted: false });
    if (!nhanvien) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(Password, nhanvien.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { 
        id: nhanvien._id, 
        MSNV: nhanvien.MSNV,
        userType: 'nhanvien',
        ChucVu: nhanvien.ChucVu
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        MSNV: nhanvien.MSNV,
        HoTenNV: nhanvien.HoTenNV,
        Email: nhanvien.Email,
        ChucVu: nhanvien.ChucVu
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;