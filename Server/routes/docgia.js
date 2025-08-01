const express = require('express');
const Docgia = require('../models/Docgia');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Lấy thông tin độc giả hiện tại
router.get('/profile', auth, async (req, res) => {
  try {
    const docgia = await Docgia.findById(req.user.id).select('-MatKhau');
    if (!docgia || docgia.deleted) {
      return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    }
    res.json(docgia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật thông tin độc giả
router.put('/profile', auth, async (req, res) => {
  try {
    const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = req.body;
    
    const docgia = await Docgia.findByIdAndUpdate(
      req.user.id,
      { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai },
      { new: true }
    ).select('-MatKhau');

    if (!docgia || docgia.deleted) {
      return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    }

    res.json(docgia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;