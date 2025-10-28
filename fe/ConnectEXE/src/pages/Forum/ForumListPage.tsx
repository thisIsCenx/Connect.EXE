import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopics, approveTopic, deleteTopic, restoreTopic } from '../../services/ForumService';
import { getUserFromToken } from '../../utils/jwt';
import type { TopicResponse } from '../../types/response/ForumResponseDTO';
import { ForumTopicCard, CreateTopicForm } from '../../components/Forum';
import './styles/ForumListPage.scss';

const ForumListPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'deleted'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Determine filter logic based on role
  const isAdminOrTeacher = user && (user.role === 'admin' || user.role === 'teacher');
  
  const loadTopics = async () => {
    setLoading(true);
    try {
      let approvedFilter: boolean | undefined;
      let userIdFilter: string | undefined;
      let isActiveFilter: boolean | undefined;
      
      // Filter logic
      if (filter === 'all') {
        approvedFilter = true;
        isActiveFilter = true;
        // Everyone can see all approved topics
      } else if (filter === 'pending') {
        approvedFilter = false;
        isActiveFilter = true;
        // For pending: students see only their own, admin/teacher see all
        if (!isAdminOrTeacher) {
          userIdFilter = user?.userId;
        }
      } else if (filter === 'deleted') {
        isActiveFilter = false; // Show deleted topics (isActive = false)
        // Only admin/teacher can access this filter
      }
      
      const response = await getTopics(approvedFilter, userIdFilter, isActiveFilter, page, 10);
      
      if (response.success && response.data) {
        setTopics(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [page, filter]);

  const handleTopicClick = (topicId: string) => {
    navigate(`/forum/topics/${topicId}`);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setPage(0);
    loadTopics();
  };

  const handleApproveTopic = async (topicId: string) => {
    try {
      console.log('🔄 Approving topic:', topicId);
      const response = await approveTopic(topicId);
      
      if (response.success) {
        console.log('✅ Topic approved successfully');
        // Reload topics to refresh list
        loadTopics();
      }
    } catch (error: any) {
      console.error('❌ Error approving topic:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt bài viết');
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      console.log('🔄 Deleting topic:', topicId);
      await deleteTopic(topicId);
      console.log('✅ Topic deleted successfully');
      // Reload topics to refresh list
      loadTopics();
    } catch (error: any) {
      console.error('❌ Error deleting topic:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa chủ đề');
    }
  };

  const handleRestoreTopic = async (topicId: string) => {
    try {
      console.log('🔄 Restoring topic:', topicId);
      await restoreTopic(topicId);
      console.log('✅ Topic restored successfully');
      // Reload topics to refresh list
      loadTopics();
    } catch (error: any) {
      console.error('❌ Error restoring topic:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi khôi phục chủ đề');
    }
  };

  const categories = [
    {
      id: 'top',
      title: 'Top post',
      items: [
        { id: 'top-likes', name: 'Top likes', icon: '👍' },
        { id: 'new-posts', name: 'Bài viết mới', icon: '📝' },
        { id: 'confessions', name: 'Confessions', icon: '💬' }
      ]
    },
    {
      id: 'business',
      title: 'CÂU HỎI DOANH NGHIỆP',
      items: [
        { id: 'career', name: 'Việc làm ban thời gian', icon: '💼' },
        { id: 'info', name: 'Thông tin học bổng', icon: '🎓' }
      ]
    },
    {
      id: 'students',
      title: 'KHU VỰC ĐIỂM DANH',
      items: [
        { id: 'news', name: 'Thông báo', icon: '📢' },
        { id: 'support', name: 'Liên hệ - Góp ý', icon: '📞' }
      ]
    },
    {
      id: 'fpt',
      title: 'BẢN TIN FPTU',
      items: [
        { id: 'news-su', name: 'Tin tức- Sự kiện', icon: '📰' },
        { id: 'events', name: 'FPTU Events', icon: '🎉' }
      ]
    },
    {
      id: 'community',
      title: 'ĐỜI SỐNG SINH VIÊN',
      items: [
        { id: 'confession', name: 'FPTU Confession', icon: '💭' },
        { id: 'chat', name: 'Chat', icon: '💬' },
        { id: 'housing', name: 'Nhà trọ - chỗ ở', icon: '🏠' }
      ]
    },
    {
      id: 'skills',
      title: 'GÓC KỸ NĂNG - HỌC TẬP',
      items: [
        { id: 'soft-skills', name: 'Kỹ năng mềm', icon: '🎯' },
        { id: 'job-skills', name: 'Kỹ năng Tuyển dụng Làm việc', icon: '💼' },
        { id: 'career-path', name: 'Khởi nghiệp - Hướng nghiệp', icon: '🚀' },
        { id: 'materials', name: 'Tài liệu môn học', icon: '📚' }
      ]
    }
  ];

  return (
    <div className="forum-page">
      {/* Left Sidebar */}
      <aside className="forum-sidebar">
        <div className="sidebar-content">
          {categories.map((category) => (
            <div key={category.id} className="category-section">
              <h3 className="category-title">{category.title}</h3>
              <div className="category-items">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    className={`category-item ${activeCategory === item.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(item.id)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="forum-main">
        <div className="forum-header">
          <div className="header-tabs">
            <button
              className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </button>
            {!isAdminOrTeacher && (
              <button
                className={`tab-btn ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('approved')}
              >
                Đã duyệt
              </button>
            )}
            <button
              className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Chờ duyệt
            </button>
            {isAdminOrTeacher && (
              <button
                className={`tab-btn ${filter === 'deleted' ? 'active' : ''}`}
                onClick={() => setFilter('deleted')}
              >
                Topic đã xóa
              </button>
            )}
          </div>
          <button
            className="btn-create-topic"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            + Tạo bài viết
          </button>
        </div>

        {showCreateForm && (
          <div className="create-topic-section">
            <CreateTopicForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        <div className="forum-search">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            className="search-input"
          />
          <button className="search-icon">🔍</button>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <div className="topics-list">
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <ForumTopicCard
                    key={topic.topicId}
                    topic={topic}
                    onClick={filter !== 'deleted' ? () => handleTopicClick(topic.topicId) : () => {}}
                    onApprove={isAdminOrTeacher && filter === 'pending' ? handleApproveTopic : undefined}
                    onDelete={isAdminOrTeacher && filter !== 'deleted' ? handleDeleteTopic : undefined}
                    onRestore={isAdminOrTeacher && filter === 'deleted' ? handleRestoreTopic : undefined}
                  />
                ))
              ) : (
                <div className="no-topics">
                  {filter === 'all' 
                    ? 'Chưa có chủ đề nào đã được duyệt.'
                    : (isAdminOrTeacher 
                        ? 'Chưa có chủ đề nào cần duyệt.' 
                        : 'Bạn chưa có chủ đề nào chờ duyệt.')}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="pagination-btn"
                >
                  ← Trước
                </button>
                <span className="page-info">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="pagination-btn"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="forum-right-sidebar">
        <div className="trending-section">
          <h3>🔥 Trending</h3>
          <div className="trending-items">
            <div className="trending-item">
              <span className="trending-tag">#FPTU</span>
            </div>
            <div className="trending-item">
              <span className="trending-tag">#Tech</span>
            </div>
            <div className="trending-item">
              <span className="trending-tag">#Career</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ForumListPage;
