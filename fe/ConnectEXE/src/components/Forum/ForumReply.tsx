import React, { useState } from 'react';
import type { ReplyResponse } from '../../types/response/ForumResponseDTO';
import './styles/ForumReply.scss';

interface ForumReplyProps {
  reply: ReplyResponse;
  onReply?: (parentReplyId: string) => void;
  depth?: number; // Track nesting depth for styling
  maxDepth?: number; // Maximum nesting level
}

const ForumReply: React.FC<ForumReplyProps> = ({ 
  reply, 
  onReply,
  depth = 0,
  maxDepth = 5
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const hasChildren = reply.children && reply.children.length > 0;
  const canReply = depth < maxDepth;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const handleReplyClick = () => {
    if (onReply && canReply) {
      onReply(reply.replyId);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  // Parse content to render @mentions
  const renderContent = (content: string) => {
    // Match @mentions at the start of content
    const mentionRegex = /^(@[\w\s]+)\s+(.*)$/;
    const match = content.match(mentionRegex);
    
    if (match) {
      const mention = match[1]; // @Name
      const restContent = match[2]; // Rest of the content
      return (
        <>
          <span className="mention-tag">{mention}</span>
          {' ' + restContent}
        </>
      );
    }
    
    return content;
  };

  // Generate consistent color based on userId
  const getAvatarColor = (userId: string) => {
    // Hash userId to get a consistent number
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use hash to select from predefined gradients
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Teal
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Light
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Rose
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Peach
      'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // Sunset
    ];
    
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  return (
    <div className={`forum-reply depth-${depth}`}>
      <div className="reply-wrapper">
        {/* Avatar */}
        <div className="reply-avatar">
          <div 
            className="avatar-circle" 
            style={{ background: getAvatarColor(reply.userId) }}
          >
            {getInitials(reply.authorName)}
          </div>
        </div>

        {/* Content Container */}
        <div className="reply-main">
          <div className="reply-bubble">
            <div className="reply-author">{reply.authorName}</div>
            <div className="reply-content">{renderContent(reply.content)}</div>
          </div>

          {/* Actions */}
          <div className="reply-meta">
            <span className="reply-time">{formatDate(reply.createdAt)}</span>
            {canReply && onReply && (
              <>
                <span className="meta-separator">•</span>
                <button className="reply-action-link" onClick={handleReplyClick}>
                  Trả lời
                </button>
              </>
            )}
            {hasChildren && (
              <>
                <span className="meta-separator">•</span>
                <button className="reply-action-link toggle-link" onClick={toggleReplies}>
                  {showReplies ? 'Ẩn' : 'Hiện'} {reply.children?.length} phản hồi
                </button>
              </>
            )}
          </div>

          {/* Nested Replies */}
          {hasChildren && showReplies && (
            <div className="nested-replies">
              {reply.children?.map((childReply) => (
                <ForumReply
                  key={childReply.replyId}
                  reply={childReply}
                  onReply={onReply}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumReply;
