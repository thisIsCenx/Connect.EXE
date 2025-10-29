# Admin Module Architecture

## 📐 Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AdminDashboard.tsx                                       │  │
│  │  - useState: stats, activities, loading, error            │  │
│  │  - useEffect: fetchDashboardData()                        │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐  │
│  │  AdminService.ts                                          │  │
│  │  - getDashboardStats()                                    │  │
│  │  - getRecentActivities(limit)                            │  │
│  │  - getUsers(filters)                                      │  │
│  │  - updateUserStatus(payload)                             │  │
│  │  - getProjects(filters)                                   │  │
│  │  - approveProject(payload)                               │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼─────────────────────────────────────┘
                        │
                   HTTP (JWT Bearer Token)
                        │
┌─────────────────────────┼─────────────────────────────────────┐
│                    BACKEND (Spring Boot)                       │
│  ┌────────────────────▼─────────────────────────────────────┐ │
│  │  AdminController (@RestController)                        │ │
│  │  @PreAuthorize("hasRole('ADMIN')")                       │ │
│  │                                                            │ │
│  │  GET    /api/admin/dashboard/stats                       │ │
│  │  GET    /api/admin/users                                 │ │
│  │  PUT    /api/admin/users/{id}/status                     │ │
│  │  GET    /api/admin/projects                              │ │
│  │  POST   /api/admin/projects/{id}/approve                 │ │
│  │  GET    /api/admin/activities/recent                     │ │
│  │  DELETE /api/admin/users/{id}                            │ │
│  │  DELETE /api/admin/projects/{id}                         │ │
│  └────────────────────┬─────────────────────────────────────┘ │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐ │
│  │  AdminService (interface)                                 │ │
│  │  - Business logic contracts                               │ │
│  └────────────────────┬─────────────────────────────────────┘ │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐ │
│  │  AdminServiceImpl (@Service)                              │ │
│  │  - getDashboardStats()                                    │ │
│  │    → Count users, projects, topics, replies               │ │
│  │    → Calculate active users, pending projects             │ │
│  │    → Monthly statistics                                   │ │
│  │  - getUsers(pageable, filters)                            │ │
│  │    → Pagination, filtering, search                        │ │
│  │  - updateUserStatus(request)                              │ │
│  │    → Update user.isActive                                 │ │
│  │    → Log activity                                         │ │
│  │  - getProjects(pageable, filters)                         │ │
│  │  - approveProject(request)                                │ │
│  │    → Update project.status                                │ │
│  │    → Log activity                                         │ │
│  │  - getRecentActivities(limit)                             │ │
│  │  - Helper: convertToDTO, logActivity                      │ │
│  └────────────────────┬─────────────────────────────────────┘ │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────────┐ │
│  │  Repositories (@Repository)                               │ │
│  │  - UserRepository                                         │ │
│  │  - ProjectRepository                                      │ │
│  │  - ForumTopicRepository                                   │ │
│  │  - ForumReplyRepository                                   │ │
│  │  - ActivityLogRepository                                  │ │
│  └────────────────────┬─────────────────────────────────────┘ │
└─────────────────────────┼─────────────────────────────────────┘
                        │
                     JPA/Hibernate
                        │
┌─────────────────────────▼─────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                       │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    users     │  │   projects   │  │ forum_topics │       │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤       │
│  │ user_id      │  │ project_id   │  │ topic_id     │       │
│  │ full_name    │  │ project_name │  │ title        │       │
│  │ email        │  │ description  │  │ content      │       │
│  │ role         │  │ status       │  │ user_id      │       │
│  │ is_active    │  │ owner_id     │  │ created_at   │       │
│  │ created_at   │  │ created_at   │  │ ...          │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                │
│  ┌──────────────┐  ┌──────────────────────────────┐         │
│  │forum_replies │  │     activity_logs (NEW)     │         │
│  ├──────────────┤  ├──────────────────────────────┤         │
│  │ reply_id     │  │ activity_id                  │         │
│  │ topic_id     │  │ type (ENUM)                  │         │
│  │ content      │  │ description                  │         │
│  │ user_id      │  │ user_id                      │         │
│  │ created_at   │  │ user_name                    │         │
│  └──────────────┘  │ timestamp                    │         │
│                     │                               │         │
│                     │ Types:                        │         │
│                     │ - USER_REGISTERED             │         │
│                     │ - PROJECT_CREATED             │         │
│                     │ - PROJECT_APPROVED            │         │
│                     │ - TOPIC_CREATED               │         │
│                     │ - USER_STATUS_CHANGED         │         │
│                     │ - PROJECT_STATUS_CHANGED      │         │
│                     └──────────────────────────────┘         │
└───────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Example

### Example: Get Dashboard Stats

```
1. User clicks Dashboard
   │
   ▼
2. AdminDashboard.tsx
   │ useEffect(() => fetchDashboardData())
   │
   ▼
3. AdminService.ts
   │ getDashboardStats()
   │ → axios.get('/api/admin/dashboard/stats', {
   │     headers: { Authorization: 'Bearer ' + getToken() }
   │   })
   │
   ▼
4. AdminController.java
   │ @GetMapping("/dashboard/stats")
   │ @PreAuthorize("hasRole('ADMIN')")
   │ → Security check JWT + ADMIN role
   │
   ▼
5. AdminServiceImpl.java
   │ getDashboardStats()
   │ ├─ userRepository.count() → 150
   │ ├─ projectRepository.count() → 45
   │ ├─ forumTopicRepository.count() → 89
   │ ├─ forumReplyRepository.count() → 342
   │ ├─ Filter pending projects → 12
   │ ├─ Filter active users → 78
   │ ├─ Filter projects this month → 8
   │ └─ Filter topics this month → 23
   │
   ▼
6. Build DashboardStatsResponseDTO
   │ {
   │   totalUsers: 150,
   │   totalProjects: 45,
   │   ...
   │ }
   │
   ▼
7. Return to Frontend
   │
   ▼
8. AdminDashboard.tsx
   │ setStats(data)
   │ → Render statistics cards
```

## 🎯 DTOs Flow

```
REQUEST FLOW:
Browser → UpdateUserStatusRequestDTO → AdminController → AdminService
                  ↓
            { userId, status }

RESPONSE FLOW:
AdminServiceImpl → DashboardStatsResponseDTO → AdminController → Browser
                          ↓
        { totalUsers, totalProjects, ... }
```

## 🔐 Security Flow

```
1. User logs in
   │
   ▼
2. Backend generates JWT
   │ Header: { alg: "HS256", typ: "JWT" }
   │ Payload: { userId, email, role: "ADMIN" }
   │ Signature: HMACSHA256(...)
   │
   ▼
3. Frontend stores JWT
   │ localStorage/sessionStorage.setItem('jwtToken', token)
   │
   ▼
4. Every API call includes JWT
   │ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   │
   ▼
5. Backend verifies JWT
   │ @PreAuthorize("hasRole('ADMIN')")
   │ → Check signature valid
   │ → Check token not expired
   │ → Check role = ADMIN
   │
   ▼
6. Allow/Deny request
```

## 📊 Data Transformation

```
DATABASE ENTITY → DTO → JSON → FRONTEND

User entity:
├─ userId: "USER0001"
├─ fullName: "John Doe"
├─ email: "john@example.com"
├─ role: "STUDENT"
├─ isActive: true
├─ createdAt: LocalDateTime
└─ ... (20+ fields)
    │
    ▼ convertToAdminUserDTO()
    │
AdminUserDTO:
├─ userId: "USER0001"
├─ fullName: "John Doe"
├─ email: "john@example.com"
├─ role: "STUDENT"
├─ status: "ACTIVE"
├─ createdAt: "2025-10-01T10:00:00"
└─ lastLogin: null
    │
    ▼ ResponseEntity.ok()
    │
JSON Response:
{
  "userId": "USER0001",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT",
  "status": "ACTIVE",
  "createdAt": "2025-10-01T10:00:00",
  "lastLogin": null
}
    │
    ▼ AdminService.ts
    │
TypeScript Interface:
interface AdminUserDTO {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string | null;
}
```

## 🏗️ Package Structure

```
admin/
├── controller/                    # REST API Layer
│   └── AdminController.java      # @RestController
│       ├── @GetMapping           # Read endpoints
│       ├── @PostMapping          # Create/Action endpoints
│       ├── @PutMapping           # Update endpoints
│       └── @DeleteMapping        # Delete endpoints
│
├── service/                       # Business Logic Layer
│   ├── AdminService.java         # Interface (contract)
│   └── impl/
│       └── AdminServiceImpl.java # Implementation
│           ├── @Service
│           ├── @Transactional
│           └── Business logic + validation
│
└── dto/                           # Data Transfer Objects
    ├── request/                   # Input DTOs
    │   ├── UpdateUserStatusRequestDTO.java
    │   └── ApproveProjectRequestDTO.java
    └── response/                  # Output DTOs
        ├── DashboardStatsResponseDTO.java
        ├── UserListResponseDTO.java
        ├── AdminUserDTO.java
        ├── ProjectListResponseDTO.java
        ├── AdminProjectDTO.java
        ├── RecentActivitiesResponseDTO.java
        └── ActivityLogDTO.java
```

## 🔗 Dependencies

```
AdminController
    ↓ @Autowired
AdminService (interface)
    ↓ implements
AdminServiceImpl
    ↓ @Autowired
┌─────────────┬──────────────┬──────────────┬──────────────┐
│             │              │              │              │
UserRepository ProjectRepo  TopicRepo    ActivityLogRepo
```

## 🎨 Design Patterns Used

1. **MVC Pattern**: Controller → Service → Repository
2. **DTO Pattern**: Separate domain entities from API contracts
3. **Repository Pattern**: Data access abstraction
4. **Builder Pattern**: DTO construction with Lombok @Builder
5. **Dependency Injection**: @Autowired, @RequiredArgsConstructor
6. **Service Layer Pattern**: Business logic separation
7. **Interface-Implementation**: Loose coupling
