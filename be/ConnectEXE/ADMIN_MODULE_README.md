# Admin Module - Backend Implementation

## Cấu Trúc Thư Mục

```
be/ConnectEXE/src/main/java/com/connectexe/ConnectEXE/admin/
├── controller/
│   └── AdminController.java          # REST API endpoints
├── dto/
│   ├── request/
│   │   ├── ApproveProjectRequestDTO.java
│   │   └── UpdateUserStatusRequestDTO.java
│   └── response/
│       ├── ActivityLogDTO.java
│       ├── AdminProjectDTO.java
│       ├── AdminUserDTO.java
│       ├── DashboardStatsResponseDTO.java
│       ├── ProjectListResponseDTO.java
│       ├── RecentActivitiesResponseDTO.java
│       └── UserListResponseDTO.java
├── service/
│   ├── AdminService.java             # Service interface
│   └── impl/
│       └── AdminServiceImpl.java     # Service implementation
```

## Endpoints Đã Implement

### 1. Dashboard Statistics
```
GET /api/admin/dashboard/stats
```
Trả về thống kê tổng quan:
- Total users, projects, topics, replies
- Pending projects
- Active users
- Projects/Topics created this month

### 2. User Management
```
GET /api/admin/users?page=0&size=10&role=STUDENT&status=ACTIVE&searchQuery=john
```
Danh sách users với phân trang và filter.

```
PUT /api/admin/users/{userId}/status
Body: { "status": "ACTIVE" | "INACTIVE" | "SUSPENDED" }
```
Cập nhật trạng thái user.

```
DELETE /api/admin/users/{userId}
```
Xóa user.

### 3. Project Management
```
GET /api/admin/projects?page=0&size=10&status=PENDING&searchQuery=smart
```
Danh sách projects với phân trang và filter.

```
POST /api/admin/projects/{projectId}/approve
Body: { "approved": true, "reason": "Meets requirements" }
```
Phê duyệt hoặc từ chối project.

```
DELETE /api/admin/projects/{projectId}
```
Xóa project.

### 4. Activity Logs
```
GET /api/admin/activities/recent?limit=10
```
Lấy danh sách hoạt động gần đây.

## Database Migration

Chạy file `database_migration_activity_logs.sql` để tạo bảng `activity_logs`:

```sql
-- Nếu dùng PostgreSQL
psql -U postgres -d ConnectEXE -f database_migration_activity_logs.sql

-- Hoặc dùng pgAdmin/DBeaver
```

Bảng sẽ lưu các loại hoạt động:
- USER_REGISTERED
- PROJECT_CREATED
- PROJECT_APPROVED
- TOPIC_CREATED
- USER_STATUS_CHANGED
- PROJECT_STATUS_CHANGED

## Security

Tất cả endpoints yêu cầu:
- JWT token trong header: `Authorization: Bearer <token>`
- User phải có role `ADMIN`
- Sử dụng `@PreAuthorize("hasRole('ADMIN')")` trên controller

## Cách Test

### 1. Login với admin account
```bash
POST http://localhost:8080/api/auth/login
{
  "email": "admin@connectexe.com",
  "password": "admin123"
}
```

### 2. Lấy token từ response và test các endpoints
```bash
# Get dashboard stats
GET http://localhost:8080/api/admin/dashboard/stats
Authorization: Bearer <your-token>

# Get users list
GET http://localhost:8080/api/admin/users?page=0&size=10
Authorization: Bearer <your-token>

# Get recent activities
GET http://localhost:8080/api/admin/activities/recent?limit=5
Authorization: Bearer <your-token>
```

## Tích Hợp với Frontend

Frontend đã sẵn sàng kết nối:
- Service: `fe/ConnectEXE/src/services/AdminService.ts`
- Component: `fe/ConnectEXE/src/pages/Dashboard/AdminDashboard.tsx`
- DTOs: `fe/ConnectEXE/src/types/response/AdminResponseDTO.ts`

## Notes

1. **Filtering hiện tại đơn giản**: In-memory filtering trong service. Có thể cải thiện bằng custom JPA queries.

2. **LastLogin chưa implement**: User entity cần thêm field `lastLogin` để tracking.

3. **Activity logging**: Tự động log các hoạt động quan trọng (approve project, change user status).

4. **Error handling**: Global exception handler trong controller trả về format chuẩn.

5. **Pagination**: Hỗ trợ sorting động qua query params.

## Todo

- [ ] Add custom JPA queries cho filtering hiệu quả hơn
- [ ] Add lastLogin tracking trong User entity
- [ ] Implement batch operations (bulk delete, bulk approve)
- [ ] Add more activity types
- [ ] Implement email notifications khi project được approve
- [ ] Add audit trail cho tất cả admin actions
