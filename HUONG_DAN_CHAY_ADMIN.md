# 🎯 HƯỚNG DẪN CHẠY ADMIN MODULE

## 1️⃣ Setup Database (Bước Quan Trọng!)

### Option A: Dùng pgAdmin
1. Mở pgAdmin
2. Connect tới database `ConnectEXE`
3. Mở Query Tool
4. Copy nội dung file `database_migration_activity_logs.sql`
5. Execute query

### Option B: Dùng Command Line (nếu có psql)
```bash
psql -U postgres -d ConnectEXE -f database_migration_activity_logs.sql
```

### Option C: Dùng DBeaver/DataGrip
1. Connect tới database
2. Open SQL Console
3. Paste và run script

## 2️⃣ Start Backend Server

```bash
cd "d:\FPTU\Semester 7th\EXE101\Connect.EXE\be\ConnectEXE"
./mvnw spring-boot:run
```

Hoặc trong VS Code: Nhấn F5 hoặc Run → Start Debugging

**Backend sẽ chạy ở:** http://localhost:8080

## 3️⃣ Test API

### Cách 1: Dùng REST Client Extension (VS Code)
1. Install extension: "REST Client" by Huachao Mao
2. Mở file `admin_api_test.http`
3. Click "Send Request" trên mỗi request

### Cách 2: Dùng Postman
Import file `admin_api_test.http` vào Postman

### Cách 3: Dùng Browser Console
```javascript
// Login trước để lấy token
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@connectexe.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => console.log('Token:', data.jwtToken));

// Sau đó test dashboard stats
fetch('http://localhost:8080/api/admin/dashboard/stats', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(r => r.json())
.then(data => console.log('Stats:', data));
```

## 4️⃣ Start Frontend

```bash
cd "d:\FPTU\Semester 7th\EXE101\Connect.EXE\fe\ConnectEXE"
npm run dev
```

**Frontend sẽ chạy ở:** http://localhost:5173

## 5️⃣ Access Admin Dashboard

1. Truy cập: http://localhost:5173
2. Login với admin account:
   - Email: `admin@connectexe.com`
   - Password: `admin123`
3. Sau khi login, nhấn vào **Dashboard** trên navbar
4. Hoặc truy cập trực tiếp: http://localhost:5173/admin

## 6️⃣ Tạo Admin Account (Nếu Chưa Có)

### Option A: Dùng SQL
```sql
INSERT INTO users (
  user_id, full_name, email, password, 
  role, is_active, is_verified, created_at
) VALUES (
  'ADMIN001', 
  'Admin User', 
  'admin@connectexe.com',
  '$2a$10$...',  -- BCrypt hash của "admin123"
  'ADMIN',
  true,
  true,
  NOW()
);
```

### Option B: Register rồi update role
```sql
-- Sau khi register account bình thường
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

## 7️⃣ Troubleshooting

### ❌ Lỗi: "403 Forbidden" khi gọi API
**Nguyên nhân:** User không có role ADMIN
**Giải pháp:**
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### ❌ Lỗi: "Table activity_logs does not exist"
**Nguyên nhân:** Chưa chạy migration
**Giải pháp:** Chạy lại bước 1

### ❌ Lỗi: "Cannot connect to database"
**Nguyên nhân:** Database chưa start hoặc config sai
**Giải pháp:**
1. Check PostgreSQL service đang chạy
2. Kiểm tra `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ConnectEXE
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### ❌ Lỗi: "Port 8080 already in use"
**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Hoặc đổi port trong application.properties
server.port=8081
```

### ❌ Frontend không gọi được API
**Giải pháp:** Check CORS config trong backend
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 8️⃣ Kiểm Tra Kết Quả

### Backend Health Check
```bash
curl http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "totalUsers": 150,
  "totalProjects": 45,
  "totalTopics": 89,
  "totalReplies": 342,
  "pendingProjects": 12,
  "activeUsers": 78,
  "projectsThisMonth": 8,
  "topicsThisMonth": 23
}
```

### Frontend Check
1. ✅ Dashboard button hiển thị trên navbar (chỉ cho admin)
2. ✅ Admin dashboard page load thành công
3. ✅ Statistics cards hiển thị đúng số liệu
4. ✅ Recent activities hiển thị danh sách hoạt động

## 9️⃣ Demo Data

Nếu muốn test với nhiều data hơn, run script:
```sql
-- Create sample users
INSERT INTO users (user_id, full_name, email, password, role, is_active, is_verified, created_at)
SELECT 
  'USER' || LPAD(generate_series::text, 4, '0'),
  'User ' || generate_series,
  'user' || generate_series || '@test.com',
  '$2a$10$...',
  'STUDENT',
  true,
  true,
  NOW() - (random() * interval '30 days')
FROM generate_series(1, 50);

-- Create sample activities
INSERT INTO activity_logs (activity_id, type, description, user_id, user_name, timestamp)
SELECT 
  SUBSTRING(MD5(RANDOM()::text), 1, 12),
  (ARRAY['USER_REGISTERED', 'PROJECT_CREATED', 'PROJECT_APPROVED', 'TOPIC_CREATED'])[floor(random() * 4 + 1)],
  'Sample activity ' || generate_series,
  'USER' || LPAD(floor(random() * 50 + 1)::text, 4, '0'),
  'User ' || floor(random() * 50 + 1),
  NOW() - (random() * interval '7 days')
FROM generate_series(1, 100);
```

## 🎉 Success Checklist

- [ ] Database migration chạy thành công
- [ ] Backend compile không lỗi (BUILD SUCCESS)
- [ ] Backend server start thành công trên port 8080
- [ ] API test trả về data đúng
- [ ] Frontend connect được backend
- [ ] Admin dashboard hiển thị statistics
- [ ] Recent activities hiển thị danh sách
- [ ] CORS không bị lỗi
- [ ] JWT authentication hoạt động

**Nếu tất cả checklist ✅ → Admin Module đã hoạt động hoàn hảo! 🚀**

## 📚 Tài Liệu Tham Khảo

- `ADMIN_MODULE_README.md` - Technical details
- `ADMIN_API_GUIDE.md` - API documentation
- `ADMIN_IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `admin_api_test.http` - API test requests
