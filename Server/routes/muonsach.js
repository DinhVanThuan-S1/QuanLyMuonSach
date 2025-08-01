const express = require('express');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const Sach = require('../models/Sach');
const Docgia = require('../models/Docgia');
const { auth, authAdmin } = require('../middleware/auth');

const router = express.Router();

// Tự động cập nhật trạng thái quá hạn
const updateOverdueStatus = async () => {
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  
  await TheoDoiMuonSach.updateMany(
    {
      TrangThai: 'Đang mượn',
      NgayMuon: { $lte: tenDaysAgo },
      deleted: false
    },
    { TrangThai: 'Quá hạn' }
  );
};

// Đăng ký mượn sách (độc giả)
router.post('/register', auth, async (req, res) => {
  try {
    const { MaSach } = req.body;
    const MaDocGia = req.user.MaDocGia;

    // Kiểm tra sách tồn tại và còn sách
    const sach = await Sach.findOne({ MaSach, deleted: false });
    if (!sach) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    // Kiểm tra độc giả đã mượn sách này chưa (chưa trả)
    const existingBorrow = await TheoDoiMuonSach.findOne({
      MaDocGia,
      MaSach,
      TrangThai: { $in: ['Đã duyệt', 'Đang mượn'] },
      deleted: false
    });

    if (existingBorrow) {
      return res.status(400).json({ message: 'Bạn đã mượn sách này và chưa trả' });
    }

    // Kiểm tra độc giả đã mượn quá 5 lần chưa
    const borrowCount = await TheoDoiMuonSach.countDocuments({
      MaDocGia,
      TrangThai: { $in: ['Đã duyệt', 'Đang mượn'] },
      deleted: false
    });

    if (borrowCount >= 5) {
      return res.status(400).json({ message: 'Bạn đã mượn tối đa 5 cuốn sách' });
    }

    // Tự động duyệt hoặc từ chối dựa trên số lượng sách
    const TrangThai = sach.SoQuyen > 0 ? 'Đã duyệt' : 'Từ chối';
    
    // Nếu duyệt thì giảm số lượng sách
    if (TrangThai === 'Đã duyệt') {
      await Sach.findByIdAndUpdate(sach._id, { $inc: { SoQuyen: -1 } });
    }

    // Tạo phiếu mượn
    const NgayTra = new Date();
    NgayTra.setDate(NgayTra.getDate() + 10); // Tự động +10 ngày

    const phieuMuon = new TheoDoiMuonSach({
      MaDocGia,
      MaSach,
      NgayTra,
      TrangThai
    });

    await phieuMuon.save();

    res.status(201).json({
      message: TrangThai === 'Đã duyệt' ? 'Đăng ký mượn sách thành công' : 'Đăng ký không thành công do hết sách',
      phieuMuon
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy lịch sử mượn sách của độc giả
router.get('/history', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const MaDocGia = req.user.MaDocGia;

    await updateOverdueStatus(); // Cập nhật trạng thái quá hạn

    let filter = { MaDocGia, deleted: false };
    if (status) {
      filter.TrangThai = status;
    }

    const phieuMuons = await TheoDoiMuonSach.find(filter)
      .populate({
        path: 'MaSach',
        select: 'TenSach TacGia DonGia BiaSach',
        populate: {
          path: 'MaNXB',
          select: 'TenNXB'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TheoDoiMuonSach.countDocuments(filter);

    res.json({
      phieuMuons,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Hủy đăng ký mượn sách (độc giả - chỉ khi trạng thái "Đã duyệt")
router.delete('/:id', auth, async (req, res) => {
  try {
    const phieuMuon = await TheoDoiMuonSach.findOne({
      _id: req.params.id,
      MaDocGia: req.user.MaDocGia,
      TrangThai: 'Đã duyệt',
      deleted: false
    });

    if (!phieuMuon) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn hoặc không thể hủy' });
    }

    // Xóa mềm phiếu mượn và hoàn lại số lượng sách
    await TheoDoiMuonSach.findByIdAndUpdate(req.params.id, { deleted: true });
    await Sach.findOneAndUpdate(
      { MaSach: phieuMuon.MaSach },
      { $inc: { SoQuyen: 1 } }
    );

    res.json({ message: 'Hủy đăng ký mượn sách thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// === ADMIN ROUTES ===

// Lấy danh sách phiếu mượn (admin)
router.get('/admin/all', authAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, sort = 'newest' } = req.query;

    await updateOverdueStatus(); // Cập nhật trạng thái quá hạn

    let filter = { deleted: false };
    if (status) {
      filter.TrangThai = status;
    }

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'a-z':
        sortOption = { 'docgia.Ten': 1 };
        break;
      case 'z-a':
        sortOption = { 'docgia.Ten': -1 };
        break;
      default: // newest
        sortOption = { createdAt: -1 };
    }

    const phieuMuons = await TheoDoiMuonSach.find(filter)
      .populate({
        path: 'MaDocGia',
        select: 'HoLot Ten DienThoai'
      })
      .populate({
        path: 'MaSach',
        select: 'TenSach TacGia BiaSach',
        populate: {
          path: 'MaNXB',
          select: 'TenNXB'
        }
      })
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TheoDoiMuonSach.countDocuments(filter);

    res.json({
      phieuMuons,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Chuyển trạng thái "Đã duyệt" -> "Đang mượn" (admin)
router.put('/admin/:id/borrowing', authAdmin, async (req, res) => {
  try {
    const phieuMuon = await TheoDoiMuonSach.findOneAndUpdate(
      { _id: req.params.id, TrangThai: 'Đã duyệt', deleted: false },
      { TrangThai: 'Đang mượn' },
      { new: true }
    );

    if (!phieuMuon) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn hoặc trạng thái không hợp lệ' });
    }

    res.json({ message: 'Cập nhật trạng thái thành công', phieuMuon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Chuyển trạng thái "Đang mượn" -> "Đã trả" (admin)
router.put('/admin/:id/returned', authAdmin, async (req, res) => {
  try {
    const phieuMuon = await TheoDoiMuonSach.findOneAndUpdate(
      { _id: req.params.id, TrangThai: { $in: ['Đang mượn', 'Quá hạn'] }, deleted: false },
      { TrangThai: 'Đã trả' },
      { new: true }
    );

    if (!phieuMuon) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn hoặc trạng thái không hợp lệ' });
    }

    // Hoàn lại số lượng sách
    await Sach.findOneAndUpdate(
      { MaSach: phieuMuon.MaSach },
      { $inc: { SoQuyen: 1 } }
    );

    res.json({ message: 'Cập nhật trạng thái thành công', phieuMuon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa phiếu mượn (admin - chỉ khi trạng thái "Đã duyệt", "Từ chối")
router.delete('/admin/:id', authAdmin, async (req, res) => {
  try {
    const phieuMuon = await TheoDoiMuonSach.findOne({
      _id: req.params.id,
      TrangThai: { $in: ['Đã duyệt', 'Từ chối'] },
      deleted: false
    });

    if (!phieuMuon) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn hoặc không thể xóa' });
    }

    // Xóa mềm và hoàn lại số lượng sách nếu đã duyệt
    await TheoDoiMuonSach.findByIdAndUpdate(req.params.id, { deleted: true });
    
    if (phieuMuon.TrangThai === 'Đã duyệt') {
      await Sach.findOneAndUpdate(
        { MaSach: phieuMuon.MaSach },
        { $inc: { SoQuyen: 1 } }
      );
    }

    res.json({ message: 'Xóa phiếu mượn thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;