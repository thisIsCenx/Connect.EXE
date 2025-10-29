# Hướng Dẫn Tích Hợp Cloudinary - Upload Image

## 📋 Mục Lục
1. [Chuẩn Bị](#chuẩn-bị)
2. [Cấu Hình](#cấu-hình)
3. [Cách Sử Dụng](#cách-sử-dụng)
4. [API Endpoints](#api-endpoints)
5. [Ví Dụ Frontend](#ví-dụ-frontend)

---

## 🔧 Chuẩn Bị

### 1. Tạo Tài Khoản Cloudinary
1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí
3. Sau khi đăng ký, vào **Dashboard** để lấy thông tin:
   - Cloud Name
   - API Key
   - API Secret

### 2. Thêm Cloudinary Credentials vào `.env`

Mở file `.env` trong thư mục `be/ConnectEXE/` và thêm:

```properties
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Ví dụ:**
```properties
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

## ⚙️ Cấu Hình

### Đã Tự Động Cài Đặt:
✅ **Dependency** đã được thêm vào `pom.xml`
✅ **Configuration** trong `application.properties`
✅ **CloudinaryConfig** class
✅ **CloudinaryService** interface & implementation
✅ **ImageUploadController** để test

---

## 🚀 Cách Sử Dụng

### A. Test Upload qua Postman

#### 1. Upload Image
**Endpoint:** `POST http://localhost:8080/api/upload/image`

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer YOUR_JWT_TOKEN` (nếu cần)

**Body (form-data):**
- Key: `file` | Type: File | Value: Chọn ảnh từ máy tính
- Key: `folder` | Type: Text | Value: `users` (optional, mặc định là `connect-exe`)

**Response thành công:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "url": "https://res.cloudinary.com/dxyz123abc/image/upload/v1234567890/users/abc-def-ghi.jpg",
  "publicId": "users/abc-def-ghi",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "size": 256789
}
```

#### 2. Delete Image
**Endpoint:** `DELETE http://localhost:8080/api/upload/image?publicId=users/abc-def-ghi`

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "result": "ok"
}
```

---

### B. Sử Dụng Trong Code Backend

#### 1. Inject CloudinaryService vào Service/Controller

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    
    public String uploadAvatar(String userId, MultipartFile avatarFile) throws IOException {
        // Upload to Cloudinary
        Map<String, Object> uploadResult = cloudinaryService.uploadImage(avatarFile, "users/avatars");
        
        // Get image URL
        String imageUrl = (String) uploadResult.get("secure_url");
        
        // Save URL to database
        User user = userRepository.findById(userId).orElseThrow();
        user.setAvatarUrl(imageUrl);
        userRepository.save(user);
        
        return imageUrl;
    }
}
```

#### 2. Upload Project Image

```java
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
    
    private final CloudinaryService cloudinaryService;
    private final ProjectRepository projectRepository;
    
    public String uploadProjectImage(String projectId, MultipartFile imageFile) throws IOException {
        Map<String, Object> uploadResult = cloudinaryService.uploadImage(imageFile, "projects");
        
        String imageUrl = (String) uploadResult.get("secure_url");
        
        Project project = projectRepository.findById(projectId).orElseThrow();
        project.setImageUrl(imageUrl);
        projectRepository.save(project);
        
        return imageUrl;
    }
}
```

---

## 📡 API Endpoints

### 1. Upload Image
```http
POST /api/upload/image
Content-Type: multipart/form-data

Parameters:
- file: MultipartFile (required) - Image file
- folder: String (optional) - Folder name in Cloudinary (default: "connect-exe")

Response:
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "publicId": "folder/filename",
  ...
}
```

### 2. Delete Image
```http
DELETE /api/upload/image?publicId=folder/filename

Response:
{
  "success": true,
  "message": "Image deleted successfully",
  "result": "ok"
}
```

### 3. Health Check
```http
GET /api/upload/health

Response:
{
  "status": "OK",
  "service": "Image Upload Service",
  "message": "Cloudinary integration is working"
}
```

---

## 💻 Ví Dụ Frontend (React/TypeScript)

### A. Component Upload Avatar

```tsx
import React, { useState } from 'react';
import axios from 'axios';

export const AvatarUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'users/avatars');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setImageUrl(response.data.url);
        alert('Upload thành công!');
        
        // Lưu URL vào database qua API khác
        await saveAvatarUrl(response.data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const saveAvatarUrl = async (url: string) => {
    // Call API to save avatar URL to user profile
    await axios.put(
      'http://localhost:8080/api/user/profile/avatar',
      { avatarUrl: url },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Đang upload...' : 'Upload Avatar'}
      </button>
      
      {imageUrl && (
        <div>
          <p>✅ Upload thành công!</p>
          <img src={imageUrl} alt="Avatar" style={{ width: 200, height: 200 }} />
        </div>
      )}
    </div>
  );
};
```

### B. Service để Upload (Reusable)

```typescript
// src/services/ImageUploadService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  size: number;
}

export const uploadImage = async (
  file: File, 
  folder: string = 'connect-exe'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  return response.data;
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/upload/image`, {
    params: { publicId },
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
};
```

---

## 📝 Lưu Ý Quan Trọng

### 1. Folder Structure trong Cloudinary
Nên tổ chức theo:
- `users/avatars` - Avatar người dùng
- `users/covers` - Cover photo
- `projects` - Ảnh dự án
- `forum/topics` - Ảnh trong forum
- `forum/replies` - Ảnh trong replies

### 2. Giới Hạn File
- **Max file size:** 10MB
- **Allowed formats:** JPG, PNG, GIF, WEBP, BMP
- **Free tier Cloudinary:** 25 GB storage, 25 GB bandwidth/month

### 3. Best Practices
✅ Validate file trước khi upload (size, type)
✅ Show progress bar khi upload
✅ Compress ảnh trước khi upload (nếu cần)
✅ Lưu `publicId` vào database để delete sau này
✅ Handle error gracefully

### 4. Security
⚠️ **KHÔNG BAO GIỜ** commit `.env` file lên Git
⚠️ Thêm `.env` vào `.gitignore`
✅ Dùng JWT authentication cho upload endpoints
✅ Validate user permissions trước khi upload

---

## 🐛 Troubleshooting

### Lỗi: "Invalid credentials"
→ Kiểm tra lại CLOUD_NAME, API_KEY, API_SECRET trong `.env`

### Lỗi: "File too large"
→ File vượt quá 10MB, cần compress trước khi upload

### Lỗi: "Invalid image format"
→ Chỉ chấp nhận JPG, PNG, GIF, WEBP, BMP

### Lỗi: "Unauthorized"
→ Thêm JWT token vào Authorization header

---

## 🎯 Next Steps

1. ✅ Test upload qua Postman
2. ✅ Tích hợp vào UserService cho avatar upload
3. ✅ Tích hợp vào ProjectService cho project images
4. ✅ Tạo frontend component để upload
5. ✅ Add validation & error handling
6. ✅ Add progress indicator

---

## 📞 Support

Nếu gặp vấn đề, hãy:
1. Kiểm tra log trong terminal
2. Kiểm tra Cloudinary Dashboard
3. Test với Postman trước
4. Đọc Cloudinary docs: https://cloudinary.com/documentation

---

**Chúc bạn tích hợp thành công! 🚀**
