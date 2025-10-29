import React, { useState, useRef } from 'react';
import { createTopic } from '../../services/ForumService';
import { uploadImage, deleteImage, validateImageFile } from '../../services/ImageUploadService';
import { isAuthenticated } from '../../utils/jwt';
import type { CreateTopicRequest } from '../../types/request/ForumRequestDTO';
import './styles/CreateTopicForm.scss';

interface CreateTopicFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface UploadedImage {
  url: string;
  publicId: string;
  file: File;
  preview: string;
}

const CreateTopicForm: React.FC<CreateTopicFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateTopicRequest>({
    title: '',
    content: '',
    imageUrls: [],
  });
  const [errors, setErrors] = useState<{ title?: string; content?: string; images?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; content?: string; images?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Tiêu đề không được vượt quá 100 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    }

    if (uploadedImages.length > 5) {
      newErrors.images = 'Tối đa 5 ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total images limit
    if (uploadedImages.length + files.length > 5) {
      setErrors({ ...errors, images: 'Tối đa 5 ảnh' });
      return;
    }

    setIsUploading(true);
    setErrors({ ...errors, images: undefined });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrors({ ...errors, images: validation.error });
        continue;
      }

      try {
        // Create preview
        const preview = URL.createObjectURL(file);

        // Upload to Cloudinary
        console.log('📤 Uploading image:', file.name);
        const uploadResult = await uploadImage(file, 'forum/topics');
        console.log('✅ Image uploaded:', uploadResult.url);

        // Add to uploaded images
        const newImage: UploadedImage = {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          file,
          preview,
        };

        setUploadedImages((prev) => [...prev, newImage]);
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...(prev.imageUrls || []), uploadResult.url],
        }));
      } catch (error: any) {
        console.error('❌ Upload failed:', error);
        setErrors({ 
          ...errors, 
          images: error.response?.data?.message || 'Lỗi khi upload ảnh' 
        });
      }
    }

    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (index: number) => {
    const image = uploadedImages[index];

    try {
      // Delete from Cloudinary
      console.log('🗑️ Deleting image:', image.publicId);
      await deleteImage(image.publicId);
      console.log('✅ Image deleted');

      // Revoke preview URL
      URL.revokeObjectURL(image.preview);

      // Remove from state
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls?.filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error('❌ Delete failed:', error);
      // Still remove from UI even if delete fails
      URL.revokeObjectURL(image.preview);
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls?.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Check authentication
    const hasJWT = isAuthenticated();
    const hasLocalStorage = localStorage.getItem('userId') && localStorage.getItem('fullName');
    
    console.log('🔍 Authentication check:', { hasJWT, hasLocalStorage });
    
    if (!hasJWT && !hasLocalStorage) {
      setSubmitMessage('Bạn cần đăng nhập để tạo chủ đề mới!');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }
    
    if (!hasJWT) {
      console.warn('⚠️ No JWT token found - Please login again to get new JWT token');
      setSubmitMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      console.log('📤 Creating topic with JWT authentication...');
      const response = await createTopic(formData);
      console.log('✅ Topic created:', response);
      setSubmitMessage(response.message || 'Chủ đề đã được tạo thành công, chờ duyệt!');
      
      // Clean up preview URLs
      uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      
      // Reset form
      setFormData({ title: '', content: '', imageUrls: [] });
      setUploadedImages([]);
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error: any) {
      console.error('❌ Error creating topic:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo chủ đề';
      setSubmitMessage(errorMessage);
      
      // If 401, redirect to login
      if (error.response?.status === 401) {
        console.warn('🔒 Unauthorized - Redirecting to login');
        setTimeout(() => {
          window.location.href = '/login?error=SessionExpired';
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-topic-form">
      <h2>Tạo chủ đề mới</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Tiêu đề <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={errors.title ? 'error' : ''}
            placeholder="Nhập tiêu đề chủ đề..."
            maxLength={100}
            disabled={isSubmitting}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
          <span className="char-count">{formData.title.length}/100</span>
        </div>

        <div className="form-group">
          <label htmlFor="content">
            Nội dung <span className="required">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className={errors.content ? 'error' : ''}
            placeholder="Nhập nội dung chi tiết..."
            rows={8}
            disabled={isSubmitting}
          />
          {errors.content && <span className="error-message">{errors.content}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="images">
            Hình ảnh (Tối đa 5 ảnh)
          </label>
          <div className="image-upload-container">
            <input
              ref={fileInputRef}
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              disabled={isSubmitting || isUploading || uploadedImages.length >= 5}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn-upload-image"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || isUploading || uploadedImages.length >= 5}
            >
              {isUploading ? '⏳ Đang upload...' : '📷 Thêm ảnh'}
            </button>
            <span className="image-count">
              {uploadedImages.length}/5 ảnh
            </span>
          </div>
          {errors.images && <span className="error-message">{errors.images}</span>}

          {uploadedImages.length > 0 && (
            <div className="image-preview-list">
              {uploadedImages.map((image, index) => (
                <div key={index} className="image-preview-item">
                  <img src={image.preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isSubmitting}
                    title="Xóa ảnh"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('lỗi') ? 'error' : 'success'}`}>
            {submitMessage}
          </div>
        )}

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo chủ đề'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTopicForm;
