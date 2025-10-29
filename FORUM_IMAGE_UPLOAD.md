# Hướng Dẫn Upload Ảnh Khi Đăng Bài

## 📋 Tổng Quan

Chức năng upload ảnh cho phép người dùng thêm tối đa **5 ảnh** khi tạo topic hoặc reply trong forum. Ảnh được lưu trữ trên **Cloudinary** (cloud CDN) và URL được lưu vào database PostgreSQL.

---

## 🚀 Tính Năng Đã Thêm

### 1. Frontend Components

#### **CreateTopicForm.tsx**
- ✅ Input file để chọn nhiều ảnh (multiple)
- ✅ Preview ảnh trước khi submit
- ✅ Nút xóa từng ảnh
- ✅ Validation (max 5 ảnh, max 10MB/ảnh, chỉ chấp nhận jpg/png/gif/webp/bmp)
- ✅ Upload tự động khi chọn ảnh (không đợi submit form)
- ✅ Loading indicator khi đang upload
- ✅ Xóa ảnh khỏi Cloudinary khi remove preview

#### **ImageUploadService.ts**
- ✅ `uploadImage(file, folder)` - Upload ảnh lên Cloudinary
- ✅ `deleteImage(publicId)` - Xóa ảnh từ Cloudinary
- ✅ `validateImageFile(file)` - Validate file trước khi upload

### 2. Backend Implementation

#### **Java DTOs**
- ✅ `CreateTopicRequest.imageUrls` - List<String> (max 5)
- ✅ `CreateReplyRequest.imageUrls` - List<String> (max 5)
- ✅ `TopicResponse.imageUrls` - List<String>
- ✅ `ReplyResponse.imageUrls` - List<String>
- ✅ `TopicDetailResponse.imageUrls` - List<String>

#### **Database Entities**
- ✅ `ForumTopic.imageUrls` - TEXT[] array column
- ✅ `ForumReply.imageUrls` - TEXT[] array column

#### **Service Layer**
- ✅ `ForumServiceImpl.createTopic()` - Lưu imageUrls vào database
- ✅ `ForumServiceImpl.createReply()` - Lưu imageUrls vào database
- ✅ `convertToTopicResponse()` - Include imageUrls in response
- ✅ `convertToReplyResponse()` - Include imageUrls in response

#### **Database Migration**
- ✅ `db_migration_add_image_urls.sql` - SQL script để thêm cột image_urls

---

## 📂 Cấu Trúc Files Đã Tạo/Cập Nhật

### Frontend (fe/ConnectEXE/src/)
```
services/
  ├── ImageUploadService.ts          [NEW] - Service upload ảnh
  └── ForumService.ts                [UPDATED] - Already exists
  
components/Forum/
  ├── CreateTopicForm.tsx            [UPDATED] - Thêm image upload UI
  └── styles/CreateTopicForm.scss     [UPDATED] - Thêm CSS cho image preview
  
types/
  ├── request/ForumRequestDTO.ts     [UPDATED] - Thêm imageUrls field
  └── response/ForumResponseDTO.ts   [TODO] - Cần update để match backend
```

### Backend (be/ConnectEXE/src/)
```
forum/dto/
  ├── request/
  │   ├── CreateTopicRequest.java    [UPDATED] - Thêm imageUrls field
  │   └── CreateReplyRequest.java    [UPDATED] - Thêm imageUrls field
  └── response/
      ├── TopicResponse.java         [UPDATED] - Thêm imageUrls field
      ├── ReplyResponse.java         [UPDATED] - Thêm imageUrls field
      └── TopicDetailResponse.java   [UPDATED] - Thêm imageUrls field

entity/
  ├── ForumTopic.java                [UPDATED] - Thêm imageUrls column
  └── ForumReply.java                [UPDATED] - Thêm imageUrls column

forum/service/impl/
  └── ForumServiceImpl.java          [UPDATED] - Xử lý imageUrls
```

### Database Migration
```
be/ConnectEXE/
  └── db_migration_add_image_urls.sql [NEW] - SQL để thêm cột image_urls
```

---

## 🔧 Cài Đặt & Cấu Hình

### 1. Chạy Database Migration

```bash
cd "d:\FPTU\Semester 7th\EXE101\Connect.EXE\be\ConnectEXE"
psql -U postgres -d connect_exe -f db_migration_add_image_urls.sql
```

Hoặc dùng pgAdmin:
1. Mở file `db_migration_add_image_urls.sql`
2. Copy nội dung
3. Paste vào Query Tool của pgAdmin
4. Execute (F5)

### 2. Verify Migration

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('forum_topics', 'forum_replies')
AND column_name = 'image_urls';
```

Expected output:
```
 column_name | data_type | is_nullable
-------------+-----------+-------------
 image_urls  | ARRAY     | YES
 image_urls  | ARRAY     | YES
```

### 3. Rebuild Backend

```bash
cd "d:\FPTU\Semester 7th\EXE101\Connect.EXE\be\ConnectEXE"
mvn clean install
mvn spring-boot:run
```

### 4. Cấu Hình Cloudinary (Nếu Chưa Có)

File `.env` trong `be/ConnectEXE/`:
```properties
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Lấy credentials tại: https://cloudinary.com/console

---

## 💡 Cách Sử Dụng

### Cho User:

1. **Tạo Topic Mới:**
   - Nhập tiêu đề và nội dung
   - Click nút **"📷 Thêm ảnh"**
   - Chọn ảnh từ máy tính (có thể chọn nhiều ảnh cùng lúc)
   - Đợi upload hoàn tất (sẽ thấy preview)
   - Có thể xóa ảnh bằng nút ✕ trên preview
   - Click **"Tạo chủ đề"** để submit

2. **Giới Hạn:**
   - Tối đa 5 ảnh/topic
   - Mỗi ảnh tối đa 10MB
   - Chỉ chấp nhận: JPG, PNG, GIF, WEBP, BMP

3. **Preview:**
   - Ảnh hiển thị dạng grid 120x120px
   - Hover để xem nút xóa
   - Có counter hiển thị số lượng ảnh (vd: "3/5 ảnh")

### Cho Developer:

#### Test Upload qua Postman:

**1. Upload Image:**
```http
POST http://localhost:8080/api/upload/image?folder=forum/topics
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: multipart/form-data
Body (form-data):
  file: [select image file]

Response:
{
  "success": true,
  "url": "https://res.cloudinary.com/xxx/image/upload/v123/forum/topics/uuid.jpg",
  "publicId": "forum/topics/uuid",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "size": 256789
}
```

**2. Create Topic với Images:**
```http
POST http://localhost:8080/api/forum/topics
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "title": "Test Topic",
  "content": "Test content",
  "imageUrls": [
    "https://res.cloudinary.com/.../image1.jpg",
    "https://res.cloudinary.com/.../image2.jpg"
  ]
}
```

---

## 🎨 UI/UX Features

### CSS Styling (CreateTopicForm.scss)

**Upload Button:**
- Dashed border (2px) khi idle
- Solid purple border khi hover
- Background purple tint khi hover
- Disabled state khi đã đủ 5 ảnh

**Image Preview Grid:**
- Grid layout responsive (auto-fill, min 120px)
- 1:1 aspect ratio (square thumbnails)
- Object-fit: cover (crop to fit)
- Smooth transitions

**Remove Button:**
- Red background (#ef4444)
- Appears on hover (opacity 0 → 1)
- Circle shape (28x28px)
- Position: top-right corner
- Scale up on hover

**Counter:**
- Shows "X/5 ảnh"
- Subtle gray color
- Updates real-time

---

## 🔍 Workflow Chi Tiết

### Upload Flow:

```
1. User clicks "📷 Thêm ảnh"
   ↓
2. File input opens
   ↓
3. User selects images (multiple)
   ↓
4. Frontend validation:
   - Check total count (≤ 5)
   - Check each file:
     * Size ≤ 10MB
     * Type is image/*
     * Format in [jpg, png, gif, webp, bmp]
   ↓
5. For each valid file:
   - Create local preview (URL.createObjectURL)
   - Upload to Cloudinary via ImageUploadService
   - Add URL to formData.imageUrls array
   - Add to uploadedImages state (for preview)
   ↓
6. User can remove images:
   - Delete from Cloudinary (by publicId)
   - Remove from formData.imageUrls
   - Remove from uploadedImages state
   - Revoke preview URL
   ↓
7. User submits form:
   - Send formData with imageUrls to backend
   - Backend saves to database (TEXT[] array)
   - Clean up all preview URLs
   ↓
8. Success:
   - Show success message
   - Reset form
   - Call onSuccess callback
```

### Database Storage:

```sql
-- PostgreSQL TEXT[] array format
image_urls: {"url1", "url2", "url3"}

-- Example:
{
  "https://res.cloudinary.com/abc/image/upload/v123/forum/topics/uuid1.jpg",
  "https://res.cloudinary.com/abc/image/upload/v123/forum/topics/uuid2.jpg"
}
```

---

## 📊 Database Schema

### forum_topics
```sql
ALTER TABLE forum_topics 
ADD COLUMN image_urls TEXT[];

-- Example data:
topic_id | title         | content       | image_urls
---------|---------------|---------------|----------------------------------
abc123   | My Topic      | Content here  | {"https://...", "https://..."}
def456   | Another Topic | More content  | NULL
```

### forum_replies
```sql
ALTER TABLE forum_replies 
ADD COLUMN image_urls TEXT[];

-- Example data:
reply_id | topic_id | content       | image_urls
---------|----------|---------------|----------------------------------
xyz789   | abc123   | My reply      | {"https://..."}
uvw456   | abc123   | Another reply | NULL
```

---

## 🐛 Troubleshooting

### Frontend Issues:

**1. "Upload failed" error:**
- Check console for detailed error
- Verify JWT token is valid
- Check file size (< 10MB)
- Check file format (jpg/png/gif/webp/bmp)

**2. Preview not showing:**
- Check browser console for errors
- Verify `URL.createObjectURL()` support
- Check if file is actually an image

**3. "Maximum 5 images" error:**
- Count is cumulative (already uploaded + new selection)
- Remove some images before adding more

### Backend Issues:

**1. Compilation error:**
```bash
cd "d:\FPTU\Semester 7th\EXE101\Connect.EXE\be\ConnectEXE"
mvn clean compile
```

**2. Database error (column not found):**
```sql
-- Run migration again
psql -U postgres -d connect_exe -f db_migration_add_image_urls.sql
```

**3. Cloudinary error:**
- Verify credentials in `.env`
- Check Cloudinary account quota (free tier: 25GB)
- Check image upload logs in Cloudinary dashboard

---

## 📝 TODO / Future Improvements

- [ ] Add image cropping before upload
- [ ] Add image compression option
- [ ] Show upload progress bar (%)
- [ ] Add drag & drop support
- [ ] Add image reordering (drag to reorder)
- [ ] Add lazy loading for image lists
- [ ] Add image lightbox/modal for preview
- [ ] Add image optimization (auto WebP conversion)
- [ ] Add alt text for accessibility
- [ ] Add image caption support

---

## 🔗 Related Files

### Documentation:
- `CLOUDINARY_SETUP_GUIDE.md` - Hướng dẫn setup Cloudinary
- `FORUM_IMAGE_UPLOAD.md` - File này

### Backend Files:
- `CloudinaryConfig.java` - Cloudinary configuration
- `CloudinaryService.java` - Service interface
- `CloudinaryServiceImpl.java` - Service implementation
- `ImageUploadController.java` - REST endpoints

### Frontend Files:
- `ImageUploadService.ts` - Upload service
- `CreateTopicForm.tsx` - Form component
- `CreateTopicForm.scss` - Styles

---

## ✅ Testing Checklist

### Manual Testing:

- [ ] Upload 1 image - OK
- [ ] Upload 5 images (max) - OK
- [ ] Try upload 6th image - Show error
- [ ] Upload file > 10MB - Show error
- [ ] Upload non-image file - Show error
- [ ] Remove image after upload - OK
- [ ] Submit topic with images - OK
- [ ] Verify images in database - OK
- [ ] View topic detail with images - OK
- [ ] Delete topic - Images remain in Cloudinary (manual cleanup needed)

### Integration Testing:

- [ ] Create topic without images - OK
- [ ] Create topic with 1 image - OK
- [ ] Create topic with multiple images - OK
- [ ] Edit topic (future feature) - TODO
- [ ] Delete topic - TODO: Add cleanup logic

---

**Last Updated:** 2025-10-29  
**Version:** 1.0.0  
**Author:** GitHub Copilot
