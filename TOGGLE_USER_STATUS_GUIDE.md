# 🔄 Toggle User Status - Quick Reference

## Nút Toggle Thông Minh

### ⛔ **Vô hiệu hóa** (ACTIVE → INACTIVE)
```
Khi user đang ACTIVE:
- Button: ⛔ (màu vàng)
- Click → Confirm → Set isActive = false
- User không thể đăng nhập
- Dữ liệu vẫn còn 100%
```

### ✅ **Kích hoạt lại** (INACTIVE → ACTIVE)
```
Khi user đang INACTIVE:
- Button: ✅ (màu xanh)
- Click → Confirm → Set isActive = true
- User có thể đăng nhập lại ngay
- Khôi phục toàn bộ quyền
```

## Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│  User: Nguyễn Văn A                                      │
│  Status: [Hoạt động ▼]  Action: [⛔]                     │
│         └─ ACTIVE          └─ Click để VÔ HIỆU HÓA      │
└─────────────────────────────────────────────────────────┘

          ↓ Click ⛔

┌─────────────────────────────────────────────────────────┐
│  ⚠️ Vô hiệu hóa tài khoản "Nguyễn Văn A"?               │
│                                                          │
│  Hành động này sẽ:                                       │
│  - Đặt trạng thái thành "Không hoạt động"              │
│  - User không thể đăng nhập                             │
│                                                          │
│  Bạn có chắc chắn?                                      │
│                                                          │
│     [OK]            [Cancel]                            │
└─────────────────────────────────────────────────────────┘

          ↓ Confirm

┌─────────────────────────────────────────────────────────┐
│  User: Nguyễn Văn A                                      │
│  Status: [Không hoạt động ▼]  Action: [✅]              │
│         └─ INACTIVE              └─ Click để KÍCH HOẠT  │
└─────────────────────────────────────────────────────────┘

          ↓ Click ✅

┌─────────────────────────────────────────────────────────┐
│  ✅ Kích hoạt lại tài khoản "Nguyễn Văn A"?             │
│                                                          │
│  Hành động này sẽ:                                       │
│  - Đặt trạng thái thành "Hoạt động"                    │
│  - User có thể đăng nhập                                │
│                                                          │
│  Bạn có chắc chắn?                                      │
│                                                          │
│     [OK]            [Cancel]                            │
└─────────────────────────────────────────────────────────┘

          ↓ Confirm

┌─────────────────────────────────────────────────────────┐
│  User: Nguyễn Văn A                                      │
│  Status: [Hoạt động ▼]  Action: [⛔]                     │
│         └─ ACTIVE          └─ BACK TO START             │
└─────────────────────────────────────────────────────────┘
```

## Code Flow

```typescript
// 1. User clicks button
handleToggleUserActive(userId, userName, currentStatus)

// 2. Check current status
const isActive = currentStatus === 'ACTIVE'
const newStatus = isActive ? 'INACTIVE' : 'ACTIVE'

// 3. Show confirm dialog
if (!confirm(`${action} tài khoản?`)) return

// 4. Call API
await updateUserStatus({ userId, status: newStatus })

// 5. Backend update
UPDATE users SET is_active = ? WHERE user_id = ?

// 6. Refresh UI
fetchUsers()
```

## API Endpoint

```http
PUT /api/admin/users/{userId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACTIVE"  // or "INACTIVE" or "SUSPENDED"
}
```

## Benefits

✅ **Toggle nhanh**: 1 click để đổi trạng thái
✅ **Visual feedback**: Icon & màu thay đổi theo trạng thái
✅ **Reversible**: Có thể kích hoạt lại bất cứ lúc nào
✅ **Safe**: Không xóa dữ liệu
✅ **Logged**: Tự động ghi activity log

## Use Cases

### Scenario 1: Tạm khóa user vi phạm
```
1. User spam trong forum
2. Admin click ⛔ → Vô hiệu hóa
3. User không đăng nhập được
4. Sau 7 ngày, admin click ✅ → Kích hoạt lại
```

### Scenario 2: User yêu cầu tạm ngừng
```
1. User gửi request tạm ngừng tài khoản
2. Admin click ⛔ → Vô hiệu hóa
3. User nghỉ 1 tháng
4. User quay lại, admin click ✅ → Kích hoạt lại
```

### Scenario 3: Bulk management
```
1. Filter users by role: STUDENT
2. Search: "Nguyễn Văn"
3. Tìm thấy 5 users
4. Toggle từng user theo nhu cầu
```

## vs Dropdown Status

| Feature | Toggle Button | Dropdown Status |
|---------|---------------|-----------------|
| Tốc độ | ⚡ 1 click | 🐌 2 clicks |
| Use case | Quick on/off | Chuyển sang SUSPENDED |
| Visual | Icon thay đổi | Color badge |
| Best for | ACTIVE ↔️ INACTIVE | All 3 states |

**Recommendation**: Dùng cả hai!
- Toggle button: Quick ACTIVE/INACTIVE
- Dropdown: SUSPENDED và fine-tuning
