# Hướng dẫn chạy hệ thống với nested replies

## 1. Khởi động PostgreSQL

### Cách 1: Qua Services (Windows)
1. Nhấn `Windows + R`
2. Gõ `services.msc` và Enter
3. Tìm "postgresql-x64-17"
4. Click phải → Start

### Cách 2: PowerShell với quyền Administrator
```powershell
Start-Service postgresql-x64-17
```

### Cách 3: Kiểm tra và khởi động thủ công
```powershell
# Kiểm tra trạng thái
Get-Service postgresql-x64-17

# Nếu dừng, khởi động bằng pg_ctl
# Thay đổi path cho đúng với cài đặt của bạn
pg_ctl -D "C:\Program Files\PostgreSQL\17\data" start
```

## 2. Chạy Backend (Spring Boot)

Backend sẽ tự động cập nhật database schema nhờ `spring.jpa.hibernate.ddl-auto=update`

```bash
cd be/ConnectEXE
mvn spring-boot:run
# hoặc chạy từ IDE (IntelliJ/VS Code)
```

## 3. Chạy Frontend

```bash
cd fe/ConnectEXE
npm run dev
```

## Tính năng mới - Nested Replies

### Về phía Backend:
- ✅ Thêm `parentReplyId` vào `ForumReply` entity
- ✅ Hỗ trợ self-referencing relationship
- ✅ Repository methods cho nested queries
- ✅ Hibernate sẽ tự động tạo cột `parent_reply_id`

### Về phía Frontend:
- ✅ Component `ForumReply` hiển thị nested replies với màu sắc khác nhau theo level
- ✅ Nút "Trả lời" cho phép reply vào reply (tối đa 5 levels)
- ✅ Nút "Ẩn/Hiện" để toggle child replies
- ✅ `CreateReplyForm` hỗ trợ reply to topic và reply to reply
- ✅ Auto-scroll đến form khi click "Trả lời"

### Cách sử dụng:
1. Vào trang chi tiết topic
2. Click "Trả lời" trên bất kỳ reply nào để tạo nested reply
3. Form reply sẽ hiện với indicator "@tên_tác_giả"
4. Nested replies được hiển thị với indent và màu border khác nhau
5. Click "Ẩn/Hiện X phản hồi" để collapse/expand nested replies

### Database Schema:
```sql
-- Cột mới (Hibernate sẽ tự động tạo)
ALTER TABLE forum_replies 
ADD COLUMN parent_reply_id VARCHAR(12);

-- Foreign key (Hibernate sẽ tự động tạo)
ALTER TABLE forum_replies
ADD CONSTRAINT fk_parent_reply
FOREIGN KEY (parent_reply_id) 
REFERENCES forum_replies(reply_id);
```

## Xử lý lỗi PostgreSQL

Nếu không kết nối được PostgreSQL:
- Kiểm tra service đang chạy: `Get-Service postgresql-x64-17`
- Kiểm tra port 5432 có bị chiếm: `netstat -ano | findstr :5432`
- Xem log PostgreSQL tại: `C:\Program Files\PostgreSQL\17\data\log\`
