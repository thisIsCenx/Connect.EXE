import React from 'react';
import { getUserFromToken } from '../../utils/jwt';
import type { TopicResponse } from '../../types/response/ForumResponseDTO';
import './styles/ForumTopicCard.scss';

interface ForumTopicCardProps {
  topic: TopicResponse;
  onClick: () => void;
  onApprove?: (topicId: string) => void;
  onDelete?: (topicId: string) => void;
  onRestore?: (topicId: string) => void;
}

const ForumTopicCard: React.FC<ForumTopicCardProps> = ({ topic, onClick, onApprove, onDelete, onRestore }) => {
  const user = getUserFromToken();
  const isAdminOrTeacher = user && (user.role === 'admin' || user.role === 'teacher');
  const isDeleted = onRestore !== undefined; // If onRestore exists, it's in deleted view
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick
    if (onApprove) {
      onApprove(topic.topicId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick
    e.preventDefault(); // Prevent default action
    
    if (onDelete && window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
      onDelete(topic.topicId);
    }
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick
    e.preventDefault(); // Prevent default action
    if (onRestore) {
      onRestore(topic.topicId);
    }
  };

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick when clicking in actions area
  };

  return (
    <div className={`forum-topic-card ${isDeleted ? 'deleted' : ''}`} onClick={onClick}>
      <div className="topic-header">
        <h3 className="topic-title">{topic.title}</h3>
        <div className="topic-status-actions" onClick={handleActionsClick}>
          {!topic.approved && (
            <span className="topic-status pending">Chờ duyệt</span>
          )}
          {topic.approved && (
            <span className="topic-status approved">Đã duyệt</span>
          )}
          {!topic.approved && isAdminOrTeacher && onApprove && (
            <button 
              className="btn-approve" 
              onClick={handleApprove}
              title="Duyệt bài viết"
            >
              <i className="icon-check"></i>
              Duyệt
            </button>
          )}
          {topic.approved && isAdminOrTeacher && onDelete && (
            <button 
              className="btn-delete" 
              onClick={handleDelete}
              title="Xóa bài viết"
            >
              <i className="icon-delete"></i>
              Xóa
            </button>
          )}
          {isAdminOrTeacher && onRestore && (
            <button 
              className="btn-restore" 
              onClick={handleRestore}
              title="Khôi phục bài viết"
            >
              <i className="icon-restore"></i>
              Khôi phục
            </button>
          )}
        </div>
      </div>
      
      <div className="topic-meta">
        <span className="topic-author">
          <i className="icon-user"></i>
          {topic.authorName}
        </span>
        <span className="topic-date">
          <i className="icon-calendar"></i>
          {formatDate(topic.createdAt)}
        </span>
        <span className="topic-replies">
          <i className="icon-comment"></i>
          {topic.replyCount} phản hồi
        </span>
      </div>
      
      <div className="topic-preview">
        {topic.content.substring(0, 150)}
        {topic.content.length > 150 && '...'}
      </div>
    </div>
  );
};

export default ForumTopicCard;
