import React, { useState, useEffect } from 'react';
import { createReply } from '../../services/ForumService';
import type { CreateReplyRequest } from '../../types/request/ForumRequestDTO';
import './styles/CreateReplyForm.scss';

interface CreateReplyFormProps {
  topicId: string;
  parentReplyId?: string; // Optional parent reply ID for nested replies
  parentAuthorName?: string; // Name of parent reply author for display
  parentAuthorUserId?: string; // UserId of parent reply author
  currentUserId?: string; // Current logged in user's ID
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateReplyForm: React.FC<CreateReplyFormProps> = ({ 
  topicId, 
  parentReplyId,
  parentAuthorName,
  parentAuthorUserId,
  currentUserId,
  onSuccess,
  onCancel 
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const isNestedReply = !!parentReplyId;

  // Clear form when parent changes
  useEffect(() => {
    setContent('');
    setError('');
    setSubmitMessage('');
  }, [parentReplyId]);

  const validateForm = (): boolean => {
    if (!content.trim()) {
      setError('Nội dung không được để trống');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Add @mention if replying to someone else
      let finalContent = content;
      if (isNestedReply && parentAuthorName && parentAuthorUserId && currentUserId) {
        // Only add @mention if replying to a different user
        if (parentAuthorUserId !== currentUserId) {
          finalContent = `@${parentAuthorName} ${content}`;
        }
      }
      
      const request: CreateReplyRequest = { 
        content: finalContent,
        parentReplyId 
      };
      await createReply(topicId, request);
      setSubmitMessage('Phản hồi đã được gửi thành công!');
      
      // Reset form
      setContent('');
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        setSubmitMessage('');
      }, 1500);
    } catch (error: any) {
      setSubmitMessage(error.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    setContent('');
    setError('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`create-reply-form ${isNestedReply ? 'nested' : ''}`}>
      <h3>
        {isNestedReply ? (
          <>
            Trả lời <span className="replying-to">@{parentAuthorName}</span>
          </>
        ) : (
          'Trả lời'
        )}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={error ? 'error' : ''}
            placeholder={isNestedReply ? `Trả lời @${parentAuthorName}...` : 'Nhập phản hồi của bạn...'}
            rows={isNestedReply ? 3 : 4}
            disabled={isSubmitting}
            autoFocus={isNestedReply}
          />
          {error && <span className="error-message">{error}</span>}
        </div>

        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('lỗi') ? 'error' : 'success'}`}>
            {submitMessage}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
          </button>
          
          {isNestedReply && onCancel && (
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancelClick}
              disabled={isSubmitting}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateReplyForm;
