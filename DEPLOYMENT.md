# Hướng dẫn triển khai hệ thống Quản lý Mượn Sách

## Yêu cầu hệ thống
- Node.js 16+ 
- MongoDB 4.4+
- npm hoặc yarn

## Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd QuanLyMuonSach
```

### 2. Cài đặt dependencies cho tất cả components
```bash
npm run install-all
```

### 3. Cấu hình Environment
```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin MongoDB và JWT secret của bạn
```

### 4. Khởi động MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS với brew
brew services start mongodb/brew/mongodb-community

# Windows
net start MongoDB
```

### 5. Khởi động hệ thống

#### Phương án 1: Khởi động từng component riêng lẻ
```bash
# Terminal 1: Server
cd Server
npm run dev

# Terminal 2: Client
cd Client  
npm run serve

# Terminal 3: Admin
cd Admin
npm run serve
```

#### Phương án 2: Khởi động tất cả cùng lúc (yêu cầu concurrently)
```bash
npm install -g concurrently
npm run dev
```

## Truy cập hệ thống

- **Client (Độc giả)**: http://localhost:8080
- **Admin (Quản lý)**: http://localhost:8081  
- **API Server**: http://localhost:5000

## Tài khoản mặc định

### Admin
- Email: admin@library.com
- Mật khẩu: admin123

> Tạo tài khoản admin bằng cách gọi: POST /api/nhanvien/init

## Cấu trúc Database

### Collections
- **nhanviens**: Thông tin nhân viên/admin
- **docgias**: Thông tin độc giả  
- **sachs**: Thông tin sách
- **nhaxuatbans**: Thông tin nhà xuất bản
- **theodoimuonsachs**: Phiếu mượn sách

## API Documentation

### Authentication
- `POST /api/auth/register/docgia` - Đăng ký độc giả
- `POST /api/auth/login/docgia` - Đăng nhập độc giả
- `POST /api/auth/login/admin` - Đăng nhập admin

### Books
- `GET /api/sach` - Lấy danh sách sách (có phân trang, tìm kiếm)
- `GET /api/sach/:id` - Chi tiết sách
- `POST /api/sach` - Thêm sách (admin)
- `PUT /api/sach/:id` - Cập nhật sách (admin)
- `DELETE /api/sach/:id` - Xóa sách (admin)

### Borrowing
- `POST /api/muonsach/register` - Đăng ký mượn sách
- `GET /api/muonsach/history` - Lịch sử mượn sách (độc giả)
- `GET /api/muonsach/admin/all` - Quản lý phiếu mượn (admin)
- `PUT /api/muonsach/admin/:id/borrowing` - Chuyển trạng thái sang "Đang mượn"
- `PUT /api/muonsach/admin/:id/returned` - Chuyển trạng thái sang "Đã trả"

### Dashboard
- `GET /api/dashboard/stats` - Thống kê tổng quan (admin)

## Tính năng chính

### Độc giả (Client)
- ✅ Đăng ký/đăng nhập tài khoản
- ✅ Tìm kiếm và xem sách  
- ✅ Đăng ký mượn sách
- ✅ Xem lịch sử mượn sách
- ✅ Hủy đăng ký mượn (khi đã duyệt)

### Admin
- ✅ Đăng nhập hệ thống quản lý
- ✅ Dashboard thống kê tổng quan
- ✅ Quản lý sách (CRUD)
- ✅ Quản lý phiếu mượn sách
- ✅ Duyệt/từ chối yêu cầu mượn
- ✅ Cập nhật trạng thái mượn/trả

## Quy trình mượn sách

1. **Độc giả đăng ký mượn** → Trạng thái "Đã duyệt" (tự động nếu còn sách) hoặc "Từ chối"
2. **Admin duyệt** → Chuyển "Đã duyệt" → "Đang mượn" 
3. **Độc giả trả sách** → Admin chuyển "Đang mượn" → "Đã trả"
4. **Quá hạn 10 ngày** → Tự động chuyển "Đang mượn" → "Quá hạn"

## Troubleshooting

### Lỗi kết nối MongoDB
```bash
# Kiểm tra MongoDB đang chạy
ps aux | grep mongod

# Khởi động MongoDB nếu chưa chạy
sudo systemctl start mongodb
```

### Lỗi port đã được sử dụng
```bash
# Tìm và kill process đang sử dụng port
lsof -ti:5000 | xargs kill -9
lsof -ti:8080 | xargs kill -9  
lsof -ti:8081 | xargs kill -9
```

### Lỗi CORS
- Đảm bảo server đang chạy trên port 5000
- Kiểm tra cấu hình proxy trong vue.config.js

## Deployment

### Production Build
```bash
cd Client && npm run build
cd ../Admin && npm run build
```

### Environment Variables
Cập nhật các biến môi trường cho production:
- `MONGODB_URI`: Connection string MongoDB
- `JWT_SECRET`: Secret key cho JWT
- `NODE_ENV=production`