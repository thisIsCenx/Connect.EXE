import React, { useState } from 'react';
import { createProject } from '../../services/ProjectService';
import { uploadImage } from '../../services/ImageUploadService';
import type { CreateProjectRequest } from '../../types/request/ProjectRequestDTO';
import './styles/CreateProjectForm.scss';

interface CreateProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    projectName: '',
    description: '',
    content: '',
    category: 'TECHNOLOGY',
    imageUrl: '',
    tags: '',
    members: '',
    websiteLink: '',
    githubLink: '',
    demoLink: '',
    isPublic: true,
  });

  const [tagsList, setTagsList] = useState<string[]>([]);
  const [membersList, setMembersList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    { value: 'TECHNOLOGY', label: 'Công nghệ' },
    { value: 'EDUCATION', label: 'Giáo dục' },
    { value: 'RECYCLE', label: 'Tái chế' },
    { value: 'INDUSTRIAL', label: 'Công nghiệp' },
    { value: 'OTHER', label: 'Khác' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tagsList.length < 10) {
      const newTags = [...tagsList, tagInput.trim()];
      setTagsList(newTags);
      setFormData((prev) => ({ ...prev, tags: newTags.join(',') }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = tagsList.filter((_, i) => i !== index);
    setTagsList(newTags);
    setFormData((prev) => ({ ...prev, tags: newTags.join(',') }));
  };

  const handleAddMember = () => {
    if (memberInput.trim() && membersList.length < 10) {
      const newMembers = [...membersList, memberInput.trim()];
      setMembersList(newMembers);
      setFormData((prev) => ({ ...prev, members: newMembers.join(',') }));
      setMemberInput('');
    }
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = membersList.filter((_, i) => i !== index);
    setMembersList(newMembers);
    setFormData((prev) => ({ ...prev, members: newMembers.join(',') }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Kích thước ảnh không được vượt quá 10MB' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'File phải là ảnh' }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Vui lòng nhập tiêu đề dự án';
    } else if (formData.projectName.length < 5) {
      newErrors.projectName = 'Tiêu đề phải có ít nhất 5 ký tự';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả ngắn';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung chi tiết';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Nội dung phải có ít nhất 50 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitMessage({ type: 'error', text: 'Vui lòng kiểm tra lại thông tin' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if selected
      if (imageFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(imageFile, 'projects');
        imageUrl = uploadResult.url;
        setIsUploading(false);
      }

      // Create project with backend structure
      await createProject({
        ...formData,
        imageUrl,
      });

      setSubmitMessage({ type: 'success', text: 'Đăng dự án thành công! Đang chờ duyệt...' });

      // Reset form
      setTimeout(() => {
        setFormData({
          projectName: '',
          description: '',
          content: '',
          category: 'TECHNOLOGY',
          imageUrl: '',
          tags: '',
          members: '',
          websiteLink: '',
          githubLink: '',
          demoLink: '',
          isPublic: true,
        });
        setTagsList([]);
        setMembersList([]);
        setImageFile(null);
        setImagePreview('');
        setTagInput('');
        setMemberInput('');
        
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        formData,
      });
      setSubmitMessage({
        type: 'error',
        text: error.message || 'Có lỗi xảy ra khi đăng dự án',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <form className="create-project-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Đăng dự án mới</h2>
        <p>Chia sẻ dự án khởi nghiệp của bạn với cộng đồng</p>
      </div>

      {submitMessage && (
        <div className={`submit-message ${submitMessage.type}`}>
          {submitMessage.text}
        </div>
      )}

      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="projectName">
            Tiêu đề dự án <span className="required">*</span>
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            placeholder="Nhập tiêu đề dự án..."
            maxLength={200}
            disabled={isSubmitting}
          />
          {errors.projectName && <span className="error-message">{errors.projectName}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="category">
            Danh mục <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            disabled={isSubmitting}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">
            Mô tả ngắn <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả ngắn gọn về dự án (20-500 ký tự)..."
            maxLength={500}
            rows={3}
            disabled={isSubmitting}
          />
          <span className="char-count">{formData.description.length}/500</span>
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="content">
            Nội dung chi tiết <span className="required">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Mô tả chi tiết về dự án, mục tiêu, kế hoạch thực hiện..."
            rows={8}
            disabled={isSubmitting}
          />
          {errors.content && <span className="error-message">{errors.content}</span>}
        </div>

        <div className="form-group full-width">
          <label>Ảnh bìa dự án</label>
          <div className="image-upload-section">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="image-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isSubmitting}
                  style={{ display: 'none' }}
                />
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <span>Chọn ảnh bìa</span>
                </div>
              </label>
            )}
          </div>
          {errors.image && <span className="error-message">{errors.image}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="websiteLink">Website</label>
          <input
            type="url"
            id="websiteLink"
            name="websiteLink"
            value={formData.websiteLink || ''}
            onChange={handleInputChange}
            placeholder="https://..."
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="githubLink">GitHub</label>
          <input
            type="url"
            id="githubLink"
            name="githubLink"
            value={formData.githubLink || ''}
            onChange={handleInputChange}
            placeholder="https://github.com/..."
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="demoLink">Demo</label>
          <input
            type="url"
            id="demoLink"
            name="demoLink"
            value={formData.demoLink || ''}
            onChange={handleInputChange}
            placeholder="https://..."
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="tags">Tags (Tối đa 10)</label>
          <div className="tags-input">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Nhập tag và nhấn Enter..."
              disabled={isSubmitting || tagsList.length >= 10}
            />
            <button type="button" onClick={handleAddTag} disabled={isSubmitting || !tagInput.trim()}>
              Thêm
            </button>
          </div>
          <div className="tags-list">
            {tagsList.map((tag, index) => (
              <span key={index} className="tag-item">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(index)} disabled={isSubmitting}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="members">Thành viên (Tối đa 10)</label>
          <div className="members-input">
            <input
              type="text"
              id="members"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
              placeholder="Nhập tên thành viên và nhấn Enter..."
              disabled={isSubmitting || membersList.length >= 10}
            />
            <button type="button" onClick={handleAddMember} disabled={isSubmitting || !memberInput.trim()}>
              Thêm
            </button>
          </div>
          <div className="members-list">
            {membersList.map((member, index) => (
              <span key={index} className="member-item">
                {member}
                <button type="button" onClick={() => handleRemoveMember(index)} disabled={isSubmitting}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

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
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (isUploading ? 'Đang tải ảnh...' : 'Đang đăng...') : 'Đăng dự án'}
        </button>
      </div>
    </form>
  );
};

export default CreateProjectForm;
