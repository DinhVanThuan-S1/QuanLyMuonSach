# Hệ thống Quản lý Mượn Sách - MEVN Stack

## Mô tả
Hệ thống quản lý mượn sách được xây dựng bằng MEVN Stack (MongoDB, Express.js, Vue.js, Node.js).

## Cấu trúc dự án
```
QuanLyMuonSach/
├── Server/           # Backend API (Node.js + Express.js)
├── Admin/            # Admin Frontend (Vue.js 3)
├── Client/           # Client Frontend (Vue.js 3)
├── README.md
└── package.json
```

## Công nghệ sử dụng
- **Frontend**: Vue.js 3, Bootstrap, CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT

## Cài đặt và chạy

### Backend (Server)
```bash
cd Server
npm install
npm start
```

### Admin Frontend
```bash
cd Admin
npm install
npm run serve
```

### Client Frontend
```bash
cd Client
npm install
npm run serve
```

## Cơ sở dữ liệu
**Database**: QuanLyMuonSach

**Collections**:
- **Docgia**: Quản lý thông tin độc giả
- **Sach**: Quản lý thông tin sách
- **NhaXuatBan**: Quản lý nhà xuất bản
- **TheoDoiMuonSach**: Theo dõi việc mượn trả sách
- **NhanVien**: Quản lý nhân viên/admin

## Chức năng chính

### Admin
- Đăng nhập/đăng xuất
- Tổng quan thống kê
- Quản lý sách (CRUD)
- Quản lý mượn trả sách

### Client
- Đăng ký/đăng nhập độc giả
- Tìm kiếm và xem sách
- Đăng ký mượn sách
- Xem lịch sử mượn sách