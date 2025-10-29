import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './styles/AdminDashboard.scss';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);

  useEffect(() => {
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
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('fullName');
    Cookies.remove('role');
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
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
            <Link to="/admin" className="nav-item">
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
            <Link to="/admin/reports" className="nav-item active">
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

      <main className="admin-main">
        <header className="admin-header">
          <h1>Báo cáo & Thống kê</h1>
          <p className="subtitle">Phân tích và báo cáo chi tiết</p>
        </header>

        <div className="coming-soon">
          <div className="coming-soon-icon">📈</div>
          <h2>Đang phát triển</h2>
          <p>Tính năng báo cáo và thống kê sẽ sớm được cập nhật</p>
          <ul className="feature-list">
            <li>📊 Báo cáo tổng quan</li>
            <li>📈 Biểu đồ thống kê</li>
            <li>📑 Export Excel/PDF</li>
            <li>⏰ Báo cáo định kỳ</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
