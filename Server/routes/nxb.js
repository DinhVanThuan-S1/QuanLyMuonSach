const express = require('express');
const NhaXuatBan = require('../models/NhaXuatBan');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

// Lấy danh sách nhà xuất bản (public)
router.get('/', async (req, res) => {
  try {
    const nxbs = await NhaXuatBan.find({ deleted: false }).sort({ TenNXB: 1 });
    res.json(nxbs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm nhà xuất bản (admin only)
router.post('/', authAdmin, async (req, res) => {
  try {
    const { TenNXB, DiaChi } = req.body;

    // Tạo mã NXB tự động
    const count = await NhaXuatBan.countDocuments({ deleted: false });
    const MaNXB = `NXB${String(count + 1).padStart(3, '0')}`;

    const nxb = new NhaXuatBan({
      MaNXB,
      TenNXB,
      DiaChi
    });

    await nxb.save();
    res.status(201).json(nxb);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật nhà xuất bản (admin only)
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { TenNXB, DiaChi } = req.body;
    
    const nxb = await NhaXuatBan.findByIdAndUpdate(
      req.params.id,
      { TenNXB, DiaChi },
      { new: true }
    );

    if (!nxb || nxb.deleted) {
      return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });
    }

    res.json(nxb);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa mềm nhà xuất bản (admin only)
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const nxb = await NhaXuatBan.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!nxb) {
      return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });
    }

    res.json({ message: 'Xóa nhà xuất bản thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;