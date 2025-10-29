# Admin Dashboard API Implementation Guide

## Overview
Frontend đã sẵn sàng để kết nối với backend APIs cho Admin Dashboard. Dưới đây là các endpoints cần implement.

## Required Endpoints

### 1. Get Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard/stats`
**Headers:** `Authorization: Bearer <token>`
**Response:**
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

### 2. Get Users List
**Endpoint:** `GET /api/admin/users`
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `page` (number): Page number (default: 0)
- `size` (number): Items per page (default: 10)
- `sortBy` (string): Field to sort by (optional)
- `sortOrder` (string): 'asc' or 'desc' (optional)
- `role` (string): Filter by role (optional)
- `status` (string): Filter by status (optional)
- `searchQuery` (string): Search by name/email (optional)

**Response:**
```json
{
  "users": [
    {
      "userId": "uuid",
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com",
      "role": "STUDENT",
      "status": "ACTIVE",
      "createdAt": "2025-01-15T10:30:00Z",
      "lastLogin": "2025-10-29T08:15:00Z"
    }
  ],
  "totalPages": 10,
  "currentPage": 0,
  "totalItems": 150
}
```

### 3. Update User Status
**Endpoint:** `PUT /api/admin/users/{userId}/status`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "status": "ACTIVE" | "INACTIVE" | "SUSPENDED"
}
```

### 4. Get Projects List
**Endpoint:** `GET /api/admin/projects`
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `page`, `size`, `sortBy`, `sortOrder` (same as users)
- `status` (string): Filter by status (optional)
- `searchQuery` (string): Search by title (optional)

**Response:**
```json
{
  "projects": [
    {
      "projectId": "uuid",
      "title": "Smart Campus",
      "description": "Project description",
      "owner": "Nguyễn Văn A",
      "status": "PENDING",
      "createdAt": "2025-10-25T10:00:00Z",
      "updatedAt": "2025-10-29T10:00:00Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 0,
  "totalItems": 45
}
```

### 5. Approve/Reject Project
**Endpoint:** `POST /api/admin/projects/{projectId}/approve`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "approved": true,
  "reason": "Dự án đáp ứng tiêu chuẩn" 
}
```

### 6. Get Recent Activities
**Endpoint:** `GET /api/admin/activities/recent`
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `limit` (number): Number of activities to return (default: 10)

**Response:**
```json
{
  "activities": [
    {
      "activityId": "uuid",
      "type": "USER_REGISTERED" | "PROJECT_CREATED" | "PROJECT_APPROVED" | "TOPIC_CREATED",
      "description": "Người dùng mới Nguyễn Văn A đã đăng ký",
      "userId": "uuid",
      "userName": "Nguyễn Văn A",
      "timestamp": "2025-10-29T10:30:00Z"
    }
  ],
  "totalItems": 100
}
```

### 7. Delete User
**Endpoint:** `DELETE /api/admin/users/{userId}`
**Headers:** `Authorization: Bearer <token>`

### 8. Delete Project
**Endpoint:** `DELETE /api/admin/projects/{projectId}`
**Headers:** `Authorization: Bearer <token>`

## Security
- All endpoints require JWT authentication
- Must check if user role is `ADMIN`
- Return `403 Forbidden` for non-admin users
- Return `401 Unauthorized` for missing/invalid token

## Error Response Format
```json
{
  "success": false,
  "message": "Error message here",
  "timestamp": "2025-10-29T10:30:00Z"
}
```

## Implementation Priority
1. ✅ GET /api/admin/dashboard/stats (Most important)
2. ✅ GET /api/admin/activities/recent 
3. ✅ GET /api/admin/users
4. ✅ GET /api/admin/projects
5. PUT /api/admin/users/{userId}/status
6. POST /api/admin/projects/{projectId}/approve
7. DELETE endpoints

## Frontend Service
Frontend service được implement tại:
- `src/services/AdminService.ts`
- Types: `src/types/response/AdminResponseDTO.ts`
- Request DTOs: `src/types/request/AdminRequestDTO.ts`

## Testing
Nếu backend chưa sẵn sàng, frontend sẽ tự động fallback sang mock data và hiển thị error message.
