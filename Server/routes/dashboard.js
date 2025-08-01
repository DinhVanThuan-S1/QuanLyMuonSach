const express = require('express');
const Sach = require('../models/Sach');
const Docgia = require('../models/Docgia');
const NhaXuatBan = require('../models/NhaXuatBan');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

// Lấy thống kê tổng quan (admin)
router.get('/stats', authAdmin, async (req, res) => {
  try {
    // Số lượng sách trong kho
    const totalBooks = await Sach.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: null, total: { $sum: '$SoQuyen' } } }
    ]);

    // Số lượng sách đang mượn
    const borrowingBooks = await TheoDoiMuonSach.countDocuments({
      TrangThai: 'Đang mượn',
      deleted: false
    });

    // Số lượng độc giả
    const totalReaders = await Docgia.countDocuments({ deleted: false });

    // Số lượng nhà xuất bản
    const totalPublishers = await NhaXuatBan.countDocuments({ deleted: false });

    // Thống kê theo trạng thái mượn sách
    const borrowStats = await TheoDoiMuonSach.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: '$TrangThai', count: { $sum: 1 } } }
    ]);

    // Sách được mượn nhiều nhất
    const popularBooks = await TheoDoiMuonSach.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: '$MaSach', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'sachs',
          localField: '_id',
          foreignField: 'MaSach',
          as: 'sach'
        }
      },
      { $unwind: '$sach' },
      {
        $project: {
          TenSach: '$sach.TenSach',
          TacGia: '$sach.TacGia',
          count: 1
        }
      }
    ]);

    res.json({
      totalBooksInStock: totalBooks[0]?.total || 0,
      borrowingBooks,
      totalReaders,
      totalPublishers,
      borrowStats,
      popularBooks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;