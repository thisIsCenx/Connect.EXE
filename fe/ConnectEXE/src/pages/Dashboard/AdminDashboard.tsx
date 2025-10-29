import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getDashboardStats, getRecentActivities } from '../../services/AdminService';
import type { DashboardStatsResponseDTO, RecentActivityDTO } from '../../types/response/AdminResponseDTO';
import './styles/AdminDashboard.scss';

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTopics: number;
  totalReplies: number;
  pendingProjects: number;
  activeUsers: number;
  projectsThisMonth: number;
  topicsThisMonth: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalTopics: 0,
    totalReplies: 0,
    pendingProjects: 0,
    activeUsers: 0,
    projectsThisMonth: 0,
    topicsThisMonth: 0,
  });
  const [activities, setActivities] = useState<RecentActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin - prioritize storage over cookies
    const fullName = sessionStorage.getItem('userName') || 
                     localStorage.getItem('userName') || 
                     Cookies.get('fullName') || 
                     'Admin';
    
    const role = sessionStorage.getItem('userRole') || 
                 localStorage.getItem('userRole') || 
                 Cookies.get('role') || 
                 '';
    
    if (role.toUpperCase() !== 'ADMIN') {
      navigate('/');
      return;
    }

    setUser({ fullName, role: role.toUpperCase() });

    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch statistics
        const statsData = await getDashboardStats();
        setStats(statsData);

        // Fetch recent activities
        const activitiesData = await getRecentActivities(4);
        setActivities(activitiesData.activities);

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 150,
          totalProjects: 45,
          totalTopics: 89,
          totalReplies: 342,
          pendingProjects: 12,
          activeUsers: 78,
          projectsThisMonth: 8,
          topicsThisMonth: 23,
        });
        
        setActivities([
          {
            activityId: '1',
            type: 'USER_REGISTERED',
            description: 'User registered (Fallback data)',
            timestamp: new Date().toISOString(),
          },
          {
            activityId: '2',
            type: 'PROJECT_CREATED',
            description: 'Project created (Fallback data)',
            timestamp: new Date().toISOString(),
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('fullName');
    Cookies.remove('role');
    Cookies.remove('status');
    Cookies.remove('isVerified');
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo-link">
            <h2>Connect.EXE</h2>
            <span className="admin-badge">Admin</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Tổng quan</h3>
            <Link to="/admin" className="nav-item active">
              <span className="icon">📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          <div className="nav-section">
            <h3>Quản lý</h3>
            <Link to="/admin/users" className="nav-item">
              <span className="icon">👥</span>
              <span>Người dùng</span>
            </Link>
            <Link to="/admin/projects" className="nav-item">
              <span className="icon">📁</span>
              <span>Dự án</span>
            </Link>
            <Link to="/admin/forum" className="nav-item">
              <span className="icon">💬</span>
              <span>Diễn đàn</span>
            </Link>
            <Link to="/admin/reports" className="nav-item">
              <span className="icon">⚠️</span>
              <span>Báo cáo</span>
            </Link>
          </div>

          <div className="nav-section">
            <h3>Cài đặt</h3>
            <Link to="/admin/settings" className="nav-item">
              <span className="icon">⚙️</span>
              <span>Cấu hình</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.fullName.charAt(0)}</div>
            <div className="user-details">
              <p className="user-name">{user?.fullName}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Dashboard</h1>
          <p className="subtitle">Chào mừng trở lại, {user?.fullName}!</p>
        </header>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <p className="stat-label">Tổng người dùng</p>
              <h3 className="stat-value">{stats.totalUsers}</h3>
              <p className="stat-change positive">+{stats.activeUsers} hoạt động</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">📁</div>
            <div className="stat-content">
              <p className="stat-label">Dự án</p>
              <h3 className="stat-value">{stats.totalProjects}</h3>
              <p className="stat-change">+{stats.projectsThisMonth} tháng này</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <p className="stat-label">Dự án chờ duyệt</p>
              <h3 className="stat-value">{stats.pendingProjects}</h3>
              <p className="stat-change">Cần xem xét</p>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <p className="stat-label">Chủ đề diễn đàn</p>
              <h3 className="stat-value">{stats.totalTopics}</h3>
              <p className="stat-change">+{stats.topicsThisMonth} tháng này</p>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-icon">💭</div>
            <div className="stat-content">
              <p className="stat-label">Tổng phản hồi</p>
              <h3 className="stat-value">{stats.totalReplies}</h3>
              <p className="stat-change">Trên diễn đàn</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Thao tác nhanh</h2>
          <div className="actions-grid">
            <Link to="/admin/users" className="action-card">
              <span className="action-icon">➕</span>
              <h3>Thêm người dùng</h3>
              <p>Tạo tài khoản mới</p>
            </Link>
            <Link to="/admin/projects?status=pending" className="action-card">
              <span className="action-icon">✅</span>
              <h3>Duyệt dự án</h3>
              <p>{stats.pendingProjects} dự án chờ</p>
            </Link>
            <Link to="/admin/reports" className="action-card">
              <span className="action-icon">📊</span>
              <h3>Xem báo cáo</h3>
              <p>Báo cáo vi phạm</p>
            </Link>
            <Link to="/admin/settings" className="action-card">
              <span className="action-icon">⚙️</span>
              <h3>Cấu hình</h3>
              <p>Cài đặt hệ thống</p>
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity">
          <h2>Hoạt động gần đây</h2>
          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <p style={{fontSize: '12px', marginTop: '4px'}}>Đang sử dụng dữ liệu mẫu</p>
            </div>
          )}
          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const getActivityIcon = (type: string) => {
                  switch (type) {
                    case 'USER_REGISTERED': return { icon: '👤', className: 'user' };
                    case 'PROJECT_CREATED': return { icon: '🆕', className: 'new' };
                    case 'PROJECT_APPROVED': return { icon: '✅', className: 'approve' };
                    case 'TOPIC_CREATED': return { icon: '💬', className: 'forum' };
                    default: return { icon: '📝', className: 'new' };
                  }
                };

                const { icon, className } = getActivityIcon(activity.type);
                const timeAgo = getTimeAgo(activity.timestamp);

                return (
                  <div key={activity.activityId} className="activity-item">
                    <div className={`activity-icon ${className}`}>{icon}</div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.description}</p>
                      <p className="activity-time">{timeAgo}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-activities">Không có hoạt động nào gần đây</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

// Helper function to format time ago
const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

export default AdminDashboard;
