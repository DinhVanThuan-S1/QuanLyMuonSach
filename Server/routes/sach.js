const express = require('express');
const multer = require('multer');
const path = require('path');
const Sach = require('../models/Sach');
const NhaXuatBan = require('../models/NhaXuatBan');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Lấy danh sách sách (public với phân trang và tìm kiếm)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest'; // newest, oldest, a-z, z-a

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'a-z':
        sortOption = { TenSach: 1 };
        break;
      case 'z-a':
        sortOption = { TenSach: -1 };
        break;
      default: // newest
        sortOption = { createdAt: -1 };
    }

    const searchFilter = search ? {
      $or: [
        { TenSach: { $regex: search, $options: 'i' } },
        { TacGia: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const filter = { deleted: false, ...searchFilter };

    const sachs = await Sach.find(filter)
      .populate('MaNXB', 'TenNXB')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sach.countDocuments(filter);

    res.json({
      sachs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy chi tiết sách
router.get('/:id', async (req, res) => {
  try {
    const sach = await Sach.findById(req.params.id)
      .populate('MaNXB', 'TenNXB DiaChi');
    
    if (!sach || sach.deleted) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    res.json(sach);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm sách (admin only)
router.post('/', authAdmin, upload.single('BiaSach'), async (req, res) => {
  try {
    const { TenSach, MoTa, DonGia, SoQuyen, NamXuatBan, MaNXB, TacGia, DanhMuc } = req.body;

    // Kiểm tra nhà xuất bản tồn tại
    const nxb = await NhaXuatBan.findOne({ MaNXB, deleted: false });
    if (!nxb) {
      return res.status(400).json({ message: 'Nhà xuất bản không tồn tại' });
    }

    // Tạo mã sách tự động
    const count = await Sach.countDocuments({ deleted: false });
    const MaSach = `S${String(count + 1).padStart(4, '0')}`;

    const sach = new Sach({
      MaSach,
      TenSach,
      MoTa,
      DonGia: parseFloat(DonGia),
      SoQuyen: parseInt(SoQuyen),
      NamXuatBan: parseInt(NamXuatBan),
      MaNXB,
      TacGia,
      DanhMuc,
      BiaSach: req.file ? `/uploads/${req.file.filename}` : '',
      NguoiTao: req.user.MSNV
    });

    await sach.save();
    await sach.populate('MaNXB', 'TenNXB');
    
    res.status(201).json(sach);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật sách (admin only)
router.put('/:id', authAdmin, upload.single('BiaSach'), async (req, res) => {
  try {
    const { TenSach, MoTa, DonGia, SoQuyen, NamXuatBan, MaNXB, TacGia, DanhMuc } = req.body;

    const updateData = {
      TenSach,
      MoTa,
      DonGia: parseFloat(DonGia),
      SoQuyen: parseInt(SoQuyen),
      NamXuatBan: parseInt(NamXuatBan),
      MaNXB,
      TacGia,
      DanhMuc
    };

    if (req.file) {
      updateData.BiaSach = `/uploads/${req.file.filename}`;
    }

    const sach = await Sach.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('MaNXB', 'TenNXB');

    if (!sach || sach.deleted) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    res.json(sach);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa mềm sách (admin only)
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const sach = await Sach.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!sach) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    res.json({ message: 'Xóa sách thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;