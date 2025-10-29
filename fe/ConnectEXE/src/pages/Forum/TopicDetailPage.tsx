import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopicDetail, approveTopic, deleteTopic } from '../../services/ForumService';
import type { TopicDetailResponse, ReplyResponse } from '../../types/response/ForumResponseDTO';
import { ForumReply, CreateReplyForm } from '../../components/Forum';
import Header from '../../components/Home/Header';
import './styles/TopicDetailPage.scss';

const TopicDetailPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<TopicDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ 
    replyId: string; 
    authorName: string;
    authorUserId: string;
  } | null>(null);

  const loadTopic = async () => {
    if (!topicId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await getTopicDetail(topicId);
      if (response.success && response.data) {
        setTopic(response.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Không thể tải chi tiết chủ đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const handleApproveTopic = async () => {
    if (!topicId) return;
    
    setIsApproving(true);
    try {
      await approveTopic(topicId);
      await loadTopic(); // Reload to get updated status
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể duyệt chủ đề');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReplyClick = (replyId: string) => {
    // Find the reply to get author info
    const findReply = (replies: ReplyResponse[], id: string): ReplyResponse | null => {
      for (const reply of replies) {
        if (reply.replyId === id) return reply;
        if (reply.children) {
          const found = findReply(reply.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (topic) {
      const reply = findReply(topic.replies, replyId);
      if (reply) {
        setReplyingTo({ 
          replyId, 
          authorName: reply.authorName,
          authorUserId: reply.userId 
        });
        // Scroll to reply form
        setTimeout(() => {
          const replyForm = document.querySelector('.create-reply-form.nested');
          if (replyForm) {
            replyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  const handleReplySuccess = () => {
    setReplyingTo(null);
    loadTopic();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteTopic = async () => {
    if (!topicId) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa chủ đề này? Thao tác này không thể hoàn tác.')) {
      return;
    }
    
    try {
      await deleteTopic(topicId);
      alert('Đã xóa chủ đề thành công');
      navigate('/forum');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể xóa chủ đề');
    }
  };

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

  // Get user role from localStorage
  const getUserRole = (): string | undefined => {
    const role = localStorage.getItem('userRole') || undefined;
    console.log('TopicDetailPage - getUserRole:', role);
    return role;
  };

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    return localStorage.getItem('userId') || '';
  };

  const canApprove = () => {
    const role = getUserRole();
    if (!role) return false;
    
    // Convert to uppercase to handle both 'admin' and 'ADMIN' formats
    const normalizedRole = role.replace(/^ROLE_/, '').toUpperCase();
    return normalizedRole === 'TEACHER' || normalizedRole === 'ADMIN';
  };

  if (loading) {
    return (
      <>
        <Header breadcrumbs={[]} />
        <div className="topic-detail-page">
          <div className="loading">Đang tải...</div>
        </div>
      </>
    );
  }

  if (error || !topic) {
    return (
      <>
        <Header breadcrumbs={[]} />
        <div className="topic-detail-page">
          <div className="error-message">{error || 'Không tìm thấy chủ đề'}</div>
          <button onClick={() => navigate('/forum')} className="btn-back">
            Quay lại danh sách
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header breadcrumbs={[]} />
      <div className="topic-detail-page">
      <button onClick={() => navigate('/forum')} className="btn-back">
        ← Quay lại
      </button>

      <div className="topic-detail">
        <div className="topic-header">
          <h1>{topic.title}</h1>
          <div className="topic-status-bar">
            {!topic.approved ? (
              <>
                <span className="status-badge pending">Chờ duyệt</span>
                {canApprove() && (
                  <button
                    onClick={handleApproveTopic}
                    disabled={isApproving}
                    className="btn-approve"
                  >
                    {isApproving ? 'Đang duyệt...' : 'Duyệt chủ đề'}
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="status-badge approved">Đã duyệt</span>
                {canApprove() && (
                  <button
                    onClick={handleDeleteTopic}
                    className="btn-delete-topic"
                  >
                    Xóa chủ đề
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="topic-meta">
          <span className="author">
            <strong>Tác giả:</strong> {topic.authorName}
          </span>
          <span className="date">
            <strong>Ngày tạo:</strong> {formatDate(topic.createdAt)}
          </span>
          {topic.updatedAt !== topic.createdAt && (
            <span className="date">
              <strong>Cập nhật:</strong> {formatDate(topic.updatedAt)}
            </span>
          )}
        </div>

        <div className="topic-content">
          {topic.content}
        </div>

        {topic.imageUrls && topic.imageUrls.length > 0 && (
          <div className="topic-images">
            {topic.imageUrls.map((imageUrl, index) => (
              <div key={index} className="image-item">
                <img src={imageUrl} alt={`Image ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        <div className="replies-section">
          <h2>Phản hồi ({topic.replies.length})</h2>
          
          <div className="replies-list">
            {topic.replies.length > 0 ? (
              topic.replies.map((reply) => (
                <ForumReply 
                  key={reply.replyId} 
                  reply={reply}
                  onReply={handleReplyClick}
                />
              ))
            ) : (
              <div className="no-replies">
                Chưa có phản hồi nào. Hãy là người đầu tiên phản hồi!
              </div>
            )}
          </div>

          {/* Nested reply form */}
          {replyingTo && (
            <CreateReplyForm
              topicId={topic.topicId}
              parentReplyId={replyingTo.replyId}
              parentAuthorName={replyingTo.authorName}
              parentAuthorUserId={replyingTo.authorUserId}
              currentUserId={getCurrentUserId()}
              onSuccess={handleReplySuccess}
              onCancel={handleCancelReply}
            />
          )}

          {/* Root reply form */}
          <CreateReplyForm
            topicId={topic.topicId}
            currentUserId={getCurrentUserId()}
            onSuccess={loadTopic}
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default TopicDetailPage;
