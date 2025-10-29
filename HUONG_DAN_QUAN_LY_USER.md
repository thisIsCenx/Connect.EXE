# 📚 Hướng Dẫn Quản Lý Người Dùng - Admin Dashboard

## 🎯 Chức Năng Trạng Thái User

### 1. **HOẠT ĐỘNG (ACTIVE)** ✅
- **Mục đích**: User có đầy đủ quyền truy cập
- **Hành vi**:
  - ✅ Có thể đăng nhập
  - ✅ Có thể tạo dự án
  - ✅ Có thể tham gia forum
  - ✅ Có thể vote projects
- **Khi nào dùng**: Trạng thái mặc định cho user bình thường

### 2. **KHÔNG HOẠT ĐỘNG (INACTIVE)** ⚠️
- **Mục đích**: Tạm thời khóa tài khoản
- **Hành vi**:
  - ❌ Không thể đăng nhập
  - ✅ Dữ liệu vẫn còn trong hệ thống
  - ✅ Có thể kích hoạt lại bất cứ lúc nào
- **Khi nào dùng**:
  - User yêu cầu tạm ngừng tài khoản
  - User vi phạm nhẹ, cần thời gian xem xét
  - User chưa xác thực email

### 3. **ĐÃ KHÓA (SUSPENDED)** 🚫
- **Mục đích**: Cấm vĩnh viễn
- **Hành vi**:
  - ❌ Không thể đăng nhập
  - ❌ Không thể khôi phục dễ dàng
  - ⚠️ Cần admin can thiệp để mở khóa
- **Khi nào dùng**:
  - User vi phạm nghiêm trọng
  - Spam hoặc hành vi xấu
  - Tài khoản giả mạo

---

## 🗑️ Chức Năng "Xóa" User (Nút ⛔)

### ⚠️ **QUAN TRỌNG: Đây là Soft Delete (Xóa Mềm)**

**Không phải xóa cứng!** Hành động này chỉ:
1. ✅ Đặt trạng thái `isActive = false`
2. ✅ User không thể đăng nhập
3. ✅ **Dữ liệu vẫn còn 100%**:
   - Projects của user vẫn hiển thị
   - Topics/Replies vẫn còn
   - Thông tin cá nhân không bị mất

### 🔄 **So Sánh Soft Delete vs Hard Delete**

| Tính năng | Soft Delete (Hiện tại) | Hard Delete (Nguy hiểm) |
|-----------|----------------------|------------------------|
| Dữ liệu | ✅ Giữ lại | ❌ Xóa vĩnh viễn |
| Khôi phục | ✅ Dễ dàng | ❌ Không thể |
| Projects | ✅ Còn | ❌ Mất |
| Forum posts | ✅ Còn | ❌ Mất |
| Lịch sử | ✅ Còn | ❌ Mất |
| An toàn | ✅ Cao | ❌ Thấp |

### 📋 **Quy Trình Khi Nhấn Nút ⛔**

```
1. User clicks nút ⛔
   ↓
2. Hiện confirm dialog:
   "⚠️ Vô hiệu hóa tài khoản 'Nguyễn Văn A'?
   
   Hành động này sẽ:
   - Đặt trạng thái thành 'Không hoạt động'
   - User không thể đăng nhập
   - Dữ liệu vẫn được giữ lại
   
   Bạn có chắc chắn?"
   ↓
3. User confirms
   ↓
4. Backend: user.setIsActive(false)
   ↓
5. Database: UPDATE users SET is_active = false WHERE user_id = ?
   ↓
6. Log activity: "User XXX has been deactivated"
   ↓
7. Frontend: Refresh table
   ↓
8. Alert: "✅ Đã vô hiệu hóa tài khoản thành công!"
```

---

## 🔧 **Cách Sử Dụng**

### Thay Đổi Trạng Thái
1. Tìm user trong bảng
2. Click dropdown trạng thái (màu xanh)
3. Chọn trạng thái mới:
   - **Hoạt động**: Cho phép đăng nhập
   - **Không hoạt động**: Tạm khóa
   - **Đã khóa**: Cấm vĩnh viễn
4. Hệ thống tự động lưu và log activity

### Vô Hiệu Hóa Tài Khoản
1. Click nút ⛔ ở cột "Thao tác"
2. Đọc kỹ thông báo
3. Xác nhận nếu chắc chắn
4. User sẽ bị chuyển sang trạng thái "Không hoạt động"

### Khôi Phục Tài Khoản
1. Tìm user có trạng thái "Không hoạt động"
2. Click dropdown trạng thái
3. Chọn "Hoạt động"
4. User có thể đăng nhập lại ngay lập tức

---

## 🛡️ **Bảo Mật & Best Practices**

### ✅ Nên:
- Dùng "Không hoạt động" cho các trường hợp tạm thời
- Dùng "Đã khóa" cho vi phạm nghiêm trọng
- Luôn ghi log khi thay đổi trạng thái
- Kiểm tra kỹ trước khi vô hiệu hóa

### ❌ Không nên:
- Hard delete user (đã được disable)
- Khóa tài khoản admin khác
- Thay đổi trạng thái không có lý do
- Vô hiệu hóa hàng loạt không kiểm tra

---

## 💡 **Câu Hỏi Thường Gặp (FAQ)**

### Q1: Nút ⛔ có xóa dữ liệu không?
**A:** KHÔNG. Chỉ đặt `isActive = false`. Dữ liệu 100% còn nguyên.

### Q2: Làm sao khôi phục user đã bị vô hiệu hóa?
**A:** Chuyển trạng thái từ "Không hoạt động" → "Hoạt động"

### Q3: User có nhận được thông báo khi bị khóa không?
**A:** Hiện tại chưa. Cần implement email notification (TODO).

### Q4: Có thể xem lịch sử thay đổi trạng thái không?
**A:** Có! Vào `activity_logs` table hoặc xem tab "Thao tác nhanh" trong Dashboard.

### Q5: Nếu muốn xóa cứng (hard delete)?
**A:** Cần quyền superadmin và chạy trực tiếp SQL:
```sql
DELETE FROM users WHERE user_id = 'xxx';
```
⚠️ **Không khuyến khích!**

### Q6: Icon nút thay đổi khi nào?
**A:** 
- ⛔ (màu vàng): User đang active, có thể vô hiệu hóa
- 🔒 (disabled): User đã inactive, không cần vô hiệu hóa nữa

---

## 🔍 **Technical Details**

### Backend Code
```java
@Transactional
public String deleteUser(String userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    // Soft delete: Set isActive to false
    user.setIsActive(false);
    userRepository.save(user);
    
    // Log activity
    logActivity(ActivityLog.ActivityType.USER_STATUS_CHANGED,
            "User " + user.getFullName() + " has been deactivated",
            user.getUserId(), user.getFullName());
    
    return "User deactivated successfully";
}
```

### Frontend Code
```typescript
const handleDeleteUser = async (userId: string, userName: string) => {
  if (!confirm(`⚠️ Vô hiệu hóa tài khoản "${userName}"?\n\n...`)) {
    return;
  }
  
  await deleteUser(userId);
  alert('✅ Đã vô hiệu hóa tài khoản thành công!');
  fetchUsers();
};
```

### Database
```sql
-- Soft delete
UPDATE users SET is_active = false WHERE user_id = 'xxx';

-- Restore
UPDATE users SET is_active = true WHERE user_id = 'xxx';

-- Hard delete (KHÔNG DÙNG)
-- DELETE FROM users WHERE user_id = 'xxx';
```

---

## 📊 **Activity Log**

Mọi thay đổi được ghi vào `activity_logs` table:

```json
{
  "activityId": "abc123def456",
  "type": "USER_STATUS_CHANGED",
  "description": "User Nguyễn Văn A has been deactivated (soft deleted)",
  "userId": "71c1d984cf46",
  "userName": "Nguyễn Văn A",
  "timestamp": "2025-10-29T14:30:00Z"
}
```

Xem trong Dashboard → Thao tác nhanh

---

## ✨ **Tóm Tắt**

1. **Trạng thái**: ACTIVE/INACTIVE/SUSPENDED kiểm soát quyền đăng nhập
2. **Nút ⛔**: Soft delete, không xóa dữ liệu
3. **An toàn**: Có thể khôi phục bất cứ lúc nào
4. **Log**: Tất cả hành động được ghi lại
5. **Best practice**: Luôn dùng soft delete, tránh hard delete
