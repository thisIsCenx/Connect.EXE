import React, { useState } from 'react';
import { createTopic } from '../../services/ForumService';
import { isAuthenticated } from '../../utils/jwt';
import type { CreateTopicRequest } from '../../types/request/ForumRequestDTO';
import './styles/CreateTopicForm.scss';

interface CreateTopicFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateTopicForm: React.FC<CreateTopicFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateTopicRequest>({
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Tiêu đề không được vượt quá 100 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      
      // Reset form
      setFormData({ title: '', content: '' });
      
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
